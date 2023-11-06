from dotenv import load_dotenv
import os
import openai
import pinecone

load_dotenv()

pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment="asia-southeast1-gcp-free",
)
index = pinecone.Index("chatpdf")


openai.api_key = os.getenv("OPENAI_API_KEY")


async def getEmbeddings(text):
    response = await openai.Embedding.acreate(
        input=text.replace("\n", ""), model="text-embedding-ada-002"
    )
    embeddings = response["data"][0]["embedding"]
    return embeddings


async def getSummary(source, code):
    print("getting summary for", source)
    if len(code) > 10000:
        code = code[:10000]
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo-16k",
        messages=[
            {
                "role": "system",
                "content": "You are an intelligent senior software engineer who specialise in onboarding junior software engineers onto projects",
            },
            {
                "role": "user",
                "content": f"""You are onboarding a junior software engineer and explaining to them the purpose of the {source} file
        here is the code:
        ---
        {code}
        ---
        give a summary no more than 100 words of the code above
        """,
            },
        ],
    )

    print("got back summary", source)
    return response.choices[0]["message"]["content"]


async def ask(query, namespace):
    query_vector = await getEmbeddings("what is this project about?")
    query_response = index.query(
        namespace=namespace,
        top_k=10,
        include_values=True,
        include_metadata=True,
        vector=query_vector,
    )
    # form context from the top 10 results
    context = ""
    for r in query_response["matches"]:
        context += f"""source:{r.metadata['source']}\ncode content:{r.metadata['code']}\nsummary of file:{r.metadata['summary']}\n\n"""
    print("asking", query)
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo-16k",
        messages=[
            {
                "role": "system",
                "content": f"""
        AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI will answer all questions in the HTML format. including code snippets, proper HTML formatting
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions, including code snippets.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
""",
            },
            {"role": "user", "content": query},
        ],
    )
    print("got back answer")

    return response.choices[0]["message"]["content"]


def summarise_commit(diff):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-16k",
        messages=[
            {
                "role": "system",
                "content": """You are an expert programmer, and you are trying to summarize a git diff.
    Reminders about the git diff format:
    For every file, there are a few metadata lines, like (for example):
    ```
    diff --git a/lib/index.js b/lib/index.js
    index aadf691..bfef603 100644
    --- a/lib/index.js
    +++ b/lib/index.js
    ```
    This means that `lib/index.js` was modified in this commit. Note that this is only an example.
    Then there is a specifier of the lines that were modified.
    A line starting with `+` means it was added.
    A line that starting with `-` means that line was deleted.
    A line that starts with neither `+` nor `-` is code given for context and better understanding.
    It is not part of the diff.
    [...]
    EXAMPLE SUMMARY COMMENTS:
    ```
    * Raised the amount of returned recordings from `10` to `100` [packages/server/recordings_api.ts], [packages/server/constants.ts]
    * Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
    * Moved the `octokit` initialization to a separate file [src/octokit.ts], [src/index.ts]
    * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
    * Lowered numeric tolerance for test files
    ```
    Most commits will have less comments than this examples list.
    The last comment does not include the file names,
    because there were more than two relevant files in the hypothetical commit.
    Do not include parts of the example in your summary.
    It is given only as an example of appropriate comments.""",
            },
            {
                "role": "user",
                "content": f"""Please summarise the following diff file: \n\n{diff}
                    
                    """,
            },
        ],
    )

    return response.choices[0]["message"]["content"]
