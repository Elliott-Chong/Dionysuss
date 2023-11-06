from git import Repo
from langchain.document_loaders import GitLoader
import os
from dotenv import load_dotenv

load_dotenv()


def file_filter(file_path):
    ignore_filepaths = ["package-lock.json"]
    # return file_path.endswith(".md")
    for ignore_filepath in ignore_filepaths:
        if ignore_filepath in file_path:
            return False
    return True


class GithubLoader:
    def __init__(self):
        """
        this class is responsible for loading in a github repository
        """

    def load(self, url: str):
        tmp_path = f"/tmp/github_repo"
        # remove the folder if it exists
        if os.path.exists(tmp_path):
            os.system(f"rm -rf {tmp_path}")
        repo = Repo.clone_from(
            url,
            to_path=tmp_path,
        )
        branch = repo.head.reference

        loader = GitLoader(repo_path=tmp_path, branch=branch, file_filter=file_filter)
        return loader


# github_loader = GithubLoader()
# loader = github_loader.load("https://github.com/travisleow/codehub")
# docs = loader.load()
# for doc in docs:
#     print(doc.metadata["source"])
