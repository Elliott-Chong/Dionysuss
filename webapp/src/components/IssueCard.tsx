"use client";
import type { Issue } from "@prisma/client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import Modal from "./Modal";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type Props = { issue: Issue };

const IssueCard = ({ issue }: Props) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const askIssue = api.project.askIssue.useMutation();

  const triggerAnswerStream = React.useCallback((answer: string) => {
    let i = 0;
    const interval = setInterval(() => {
      setAnswer(answer.slice(0, i));
      i++;
      if (i > answer.length) {
        clearInterval(interval);
      }
    }, 6);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    toast.promise(
      askIssue.mutateAsync({
        issueId: issue.id,
        query,
      }),
      {
        loading: "Asking question...",
        success: ({ answer }) => {
          triggerAnswerStream(answer);
          setQuery("");
          return "Thank you Dionysus!";
        },
        error: "Failed to ask question",
      },
    );
  };

  return (
    <>
      <Modal open={open} setOpen={setOpen}>
        <h1 className="text-lg font-semibold text-gray-800">{issue.gist}</h1>
        <span className="text-sm text-gray-500">
          {issue.createdAt.toDateString()}
        </span>
        <div className="h-3"></div>
        <p className="text-gray-600">{issue.headline}</p>
        <div className="h-2"></div>
        <blockquote className="mt-2 border-l-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
          <span className="text-sm text-gray-600">
            {issue.start} - {issue.end}
          </span>
          <p className="font-medium italic leading-relaxed text-gray-900 dark:text-white">
            {issue.summary}
          </p>
        </blockquote>
        <form className="mt-4" onSubmit={handleSubmit}>
          <div>
            <Label>Ask for further clarification...</Label>
            <Input
              className="mt-1"
              placeholder="What did you mean by..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="text-xs text-gray-500">
              Dionysus has context about this issue and the meeting
            </span>
            {answer && (
              <>
                <p className="mt-2 text-xs font-semibold">Answer</p>
                <pre className="whitespace-pre-wrap text-sm">{answer}</pre>
              </>
            )}
          </div>
          <Button isLoading={askIssue.isLoading} className="mt-3 w-full">
            Send Question
          </Button>
        </form>
      </Modal>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-xl">{issue.gist}</CardTitle>
          <div className="border-b"></div>
          <CardDescription>{issue.headline}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-4"></div>
          <Button
            onClick={() => setOpen(true)}
            className="absolute bottom-4 left-4"
          >
            Details
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default IssueCard;
