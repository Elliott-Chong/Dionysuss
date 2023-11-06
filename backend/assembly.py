# Start by making sure the `assemblyai` package is installed.
from dotenv import load_dotenv
import os

load_dotenv()
import openai
from _openai import getEmbeddings
import pinecone

pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment="asia-southeast1-gcp-free",
)
index = pinecone.Index("chatpdf")


load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


def serialise_url(url):
    return url.replace("/", "_")


# If not, you can install it by running the following command:
# pip install -U assemblyai
#
# Note: Some macOS users may need to use `pip3` instead of `pip`.
def ms_to_time(ms):
    seconds = ms / 1000
    minutes = seconds / 60
    seconds = seconds % 60
    minutes = minutes % 60
    # format time
    return "%02d:%02d" % (minutes, seconds)


import assemblyai as aai

# Replace with your API token
aai.settings.api_key = os.getenv("AAI_TOKEN")


async def transcribe_file(url):
    config = aai.TranscriptionConfig(auto_chapters=True)
    transcriber = aai.Transcriber(config=config)
    transcript = transcriber.transcribe(url)
    summaries = []
    for chapter in transcript.chapters:
        summaries.append(
            {
                "start": ms_to_time(chapter.start),
                "end": ms_to_time(chapter.end),
                "gist": chapter.gist,
                "headline": chapter.headline,
                "summary": chapter.summary,
            }
        )

    from langchain.text_splitter import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=130)
    docs = splitter.create_documents([transcript.text])
    import asyncio

    embeddings = await asyncio.gather(
        *[getEmbeddings(doc.page_content) for doc in docs]
    )
    print("getting embeddings for audio")
    for i, doc in enumerate(docs):
        doc.metadata["embeddings"] = embeddings[i]
    import hashlib

    index.upsert(
        vectors=[
            (
                hashlib.md5(doc.page_content.encode()).hexdigest(),
                doc.metadata["embeddings"],
                {
                    "page_content": doc.page_content,
                },
            )
            for doc in docs
        ],
        namespace=serialise_url(url),
    )
    print("upserted audio embeddings")
    return summaries


async def ask_meeting(url, query, quote):
    namespace = serialise_url(url)

    query_vector = await getEmbeddings(query)
    query_response = index.query(
        namespace=namespace,
        top_k=10,
        include_values=True,
        include_metadata=True,
        vector=query_vector,
    )
    context = ""
    for r in query_response["matches"]:
        context += f"""meeting snippet: {r.metadata["page_content"]}\n"""
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo-16k",
        messages=[
            {
                "role": "system",
                "content": f"""
        AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
""",
            },
            {
                "role": "user",
                "content": f"I am asking a question in regards to this quote in the meeting: {quote}\n here is the question:"
                + query,
            },
        ],
    )
    print("got back answer for", query)

    answer = response.choices[0]["message"]["content"]
    return answer
