import { db } from "@/server/db";
import axios from "axios";
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });
// id                 String   @id @default(cuid())
// commitMessage      String
// commitHash         String
// commitAuthorName   String
// commitAuthorAvatar String
// commitDate         DateTime
// summary            String

type response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(3, 5);
  const { data } = await octokit.request(`GET /repos/${owner}/${repo}/commits`);
  //   need commit author, commit message, commit hash and commit time
  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 15).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
  //   return data.map((commit: any) => commit.sha as string);
};

export const pollRepo = async (githubUrl: string, projectId: string) => {
  const commitHases = await getCommitHashes(githubUrl);
  const processedCommits = await db.commit.findMany({
    where: {
      projectId: projectId,
    },
  });
  const unprocessedCommits = commitHases.filter(
    (hash) =>
      !processedCommits.some((commit) => commit.commitHash === hash.commitHash),
  );
  const summariesResponse = await Promise.allSettled(
    unprocessedCommits.map((hash) => {
      return axios.post(
        `${process.env.PYTHON_AI_BACKEND_URL}/summarise-commit`,
        {
          github_url: githubUrl,
          commitHash: hash.commitHash,
        },
      );
    }),
  );
  const summaries = summariesResponse.map((summary) => {
    if (summary.status === "fulfilled") {
      return summary.value.data.summary as string;
    }
  });
  const commits = await db.commit.createMany({
    data: summaries.map((summary, idx) => ({
      projectId: projectId,
      commitHash: unprocessedCommits[idx]!.commitHash,
      summary: summary!,
      commitAuthorName: unprocessedCommits[idx]!.commitAuthorName,
      commitDate: unprocessedCommits[idx]!.commitDate,
      commitMessage: unprocessedCommits[idx]!.commitMessage,
      commitAuthorAvatar: unprocessedCommits[idx]!.commitAuthorAvatar,
    })),
  });
  return commits;
};
