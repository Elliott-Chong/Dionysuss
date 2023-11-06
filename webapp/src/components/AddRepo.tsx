"use client";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
};

const AddRepo = ({ projectId }: Props) => {
  const [repoUrl, setRepoUrl] = React.useState("");
  const linkRepo = api.project.linkRepo.useMutation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.promise(
      linkRepo.mutateAsync({
        githubUrl: repoUrl,
        projectId: projectId,
      }),
      {
        loading: "Linking repository...",
        success: () => {
          router.refresh();
          return "Repository linked!";
        },
        error: "Failed to link repository",
      },
    );
  };

  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle>Link your GitHub Repository</CardTitle>
        <CardDescription>
          Enter the URL of your GitHub repository to link it to Dionysus.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="https://github.com/username/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <Button isLoading={linkRepo.isLoading} className="mt-4">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddRepo;
