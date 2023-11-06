"use client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Commit, Project } from "@prisma/client";
import { ExternalLink, GitGraph } from "lucide-react";
import Link from "next/link";

export default function CommitLog({
  project,
}: {
  project: Project & { commits: Commit[] };
}) {
  const pollCommits = api.project.pollCommits.useMutation();
  const router = useRouter();
  return (
    <>
      <Button
        className="self-center"
        onClick={() => {
          toast.promise(
            pollCommits.mutateAsync({
              projectId: project.id,
            }),
            {
              loading: "Polling commits...",
              success: () => {
                router.refresh();
                return "Successfully polled commits!";
              },
              error: "Failed to poll commits",
            },
          );
        }}
        isLoading={pollCommits.isLoading}
      >
        <GitGraph className="mr-1 h-5 w-5" />
        Poll Commits
      </Button>
      <div className="h-4"></div>
      <ul role="list" className="space-y-6">
        {project.commits.map((commit, commitIdx) => (
          <li key={commit.id} className="relative flex gap-x-4">
            <div
              className={cn(
                commitIdx === project.commits.length - 1 ? "h-6" : "-bottom-6",
                "absolute left-0 top-0 flex w-6 justify-center",
              )}
            >
              <div className="w-px translate-x-1 bg-gray-200" />
            </div>
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={commit.commitAuthorAvatar}
                alt=""
                className="relative mt-3 h-8 w-8 flex-none rounded-full bg-gray-50"
              />
              <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
                <div className="flex justify-between gap-x-4">
                  <Link
                    target="_blank"
                    className="py-0.5 text-xs leading-5 text-gray-500"
                    href={`${project.githubUrl}/commits/${commit.commitHash}`}
                  >
                    <span className="font-medium text-gray-900">
                      {commit.commitAuthorName}
                    </span>{" "}
                    <span className="inline-flex items-center">
                      committed
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </span>
                  </Link>
                  <time
                    dateTime={commit.commitDate.toString()}
                    className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                  >
                    {new Date(commit.commitDate).toLocaleString()}
                  </time>
                </div>
                <span className="font-semibold">{commit.commitMessage}</span>
                <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                  {commit.summary}
                </pre>
              </div>
            </>
          </li>
        ))}
      </ul>
    </>
  );
}
