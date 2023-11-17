from dotenv import load_dotenv
import os
import asyncio
from fastapi import FastAPI
from pydantic import BaseModel
from GithubLoader import GithubLoader
import hashlib
from _openai import getSummary, getEmbeddings, ask, summarise_commit
from assembly import transcribe_file, ask_meeting
import weaviate

load_dotenv()

weaviate.init(
    api_key=os.getenv("WEAVIATE_API_KEY"),
    environment="asia-southeast1-gcp-free",
)
index = weaviate.Index("chatpdf")

app = FastAPI()


class GenerateDocumentationRequest(BaseModel):
    github_url: str


class AskRequest(BaseModel):
    query: str
    github_url: str


def serialise_github_url(url):
    return url.replace("/", "_")


def generate_file_tree_graph(file_tree):
    graph = "graph TD;\n"

    for item in file_tree:
        if "/" in item:
            parent_dir, current_dir = item.rsplit("/", 1)
            graph += f"    {parent_dir}-->{current_dir}\n"

    return graph


@app.post("/generate_documentation")
async def generate_documentation(body: GenerateDocumentationRequest):
    github_loader = GithubLoader()
    loader = github_loader.load(body.github_url)
    raw_documents = loader.load()
    file_tree = [i.metadata["source"] for i in raw_documents]
    mermaid_graph = generate_file_tree_graph(file_tree)

    print("mermaid", mermaid_graph)
    summaries = await asyncio.gather(
        *[getSummary(doc.metadata["source"], doc.page_content) for doc in raw_documents]
    )
    # print(summaries)
    for i, doc in enumerate(raw_documents):
        doc.metadata["summary"] = summaries[i]

    embeddings = await asyncio.gather(
        *[getEmbeddings(doc.metadata["summary"]) for doc in raw_documents]
    )
    print("got summary")
    for i, doc in enumerate(raw_documents):
        doc.metadata["embedding"] = embeddings[i]
    print("got embeddings")

    upsert_response = index.upsert(
        vectors=[
            (
                hashlib.md5(doc.page_content.encode()).hexdigest(),
                doc.metadata["embedding"],
                {
                    "source": doc.metadata["source"],
                    "code": doc.page_content[:10000],
                    "summary": doc.metadata["summary"],
                },
            )
            for doc in raw_documents
        ],
        namespace=serialise_github_url(body.github_url),
    )
    questions = [
        "What is the project about?",
        "How can I get started with this project?",
        "What does the project's repository contain?",
        "Are there any coding standards or guidelines I should follow?",
        "What dependencies, packages, APIs, or libraries does the project use? Look into the package.json file.",
        "How can I build and compile the project?",
        "What should I know about testing in this project?",
        "How can I contribute to the project?",
        "How are issues tracked in this project?",
        "What's the version control strategy for this project?",
        "Tell me about the project's CI/CD pipeline.",
        "Where should I add documentation and comments in the codebase?",
    ]
    answers = await asyncio.gather(
        *[
            ask(question, serialise_github_url(body.github_url))
            for question in questions
        ]
    )
    # documentation = {}
    # for i, question in enumerate(questions):
    #     documentation[question] = answers[i]
    documentation = []
    for i, question in enumerate(questions):
        documentation.append({"question": question, "answer": answers[i]})

    projectName = body.github_url.split("/")[-1]
    documentation = f"""<h1>{projectName}</h1>
  <ul>
  <li><a href="#introduction">Introduction</a></li>
  <li><a href="#getting-started">Getting Started</a></li>
  <li><a href="#repository">Repository</a></li>
  <li><a href="#coding-standards">Coding Standards</a></li>
  <li><a href="#dependencies">Dependencies</a></li>
  <li><a href="#building-and-compiling">Building and Compiling</a></li>
  <li><a href="#testing">Testing</a></li>
  <li><a href="#contributing">Contributing</a></li>
  <li><a href="#issues">Issues</a></li>
  <li><a href="#version-control">Version Control</a></li>
  <li><a href="#ci-cd">CI/CD</a></li>
  </ul>

  <h2 id="introduction">Introduction</h2>
  <pre>{documentation[0]['answer']}</pre>
  <h2 id="getting-started">Getting Started</h2>
  <pre>{documentation[1]['answer']}</pre>
  <h2 id="repository">Repository</h2>
  <pre>{documentation[2]['answer']}</pre>
  <h2 id="coding-standards">Coding Standards</h2>
  <pre>{documentation[3]['answer']}</pre>
  <h2 id="dependencies">Dependencies</h2>
  <pre>{documentation[4]['answer']}</pre>
  <h2 id="building-and-compiling">Building and Compiling</h2>
  <pre>{documentation[5]['answer']}</pre>
  <h2 id="testing">Testing</h2>
  <pre>{documentation[6]['answer']}</pre>
  <h2 id="contributing">Contributing</h2>
  <pre>{documentation[7]['answer']}</pre>
  <h2 id="issues">Issues</h2>
  <pre>{documentation[8]['answer']}</pre>
  <h2 id="version-control">Version Control</h2>
  <pre>{documentation[9]['answer']}</pre>
  <h2 id="ci-cd">CI/CD</h2>
  <pre>{documentation[10]['answer']}</pre>"""

    return {"documentation": documentation, "mermaid": mermaid_graph}


@app.post("/ask")
async def query(body: AskRequest):
    response = await ask(body.query, serialise_github_url(body.github_url))
    return {"message": response}


class summariseCommitBody(BaseModel):
    commitHash: str
    github_url: str


@app.post("/summarise-commit")
def summariseCommits(body: summariseCommitBody):
    import requests

    response = requests.get(
        f"{body.github_url}/commit/{body.commitHash}.diff",
        headers={
            "Accept": "application/vnd.github.v3.diff",
            "Authorization": f"token {os.getenv('GITHUB_PERSONAL_ACCESS_TOKEN')}",
        },
    )
    summary = summarise_commit(str(response.content[:10000]))
    print("summary for commit", summary)
    return {"summary": summary}


class transcribeMeetingBody(BaseModel):
    url: str


@app.post("/transcribe-meeting")
async def transcribeMeeting(body: transcribeMeetingBody):
    print("transcribing", body.url)
    summaries = await transcribe_file(body.url)
    return {"summaries": summaries}


class askMeetingBody(BaseModel):
    url: str
    quote: str
    query: str


@app.post("/ask-meeting")
async def askMeeting(body: askMeetingBody):
    response = await ask_meeting(body.url, body.query, body.quote)
    return {"answer": response}


# async def main():
#     embeddings = await asyncio.gather(*[getEmbeddings(text) for text in texts])
#     print(len(embeddings))


# asyncio.run(main())
