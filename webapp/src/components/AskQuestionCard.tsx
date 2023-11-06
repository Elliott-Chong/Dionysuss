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
import Modal from "./Modal";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
};

const AskQuestionCard = ({ projectId }: Props) => {
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [answer, setAnswer] = React.useState("");
  const askQuestion = api.project.askQuestion.useMutation();
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.promise(
      askQuestion.mutateAsync({
        projectId: projectId,
        question,
      }),
      {
        loading: "Thinking...",
        error: "Failed to link repository",
        success: (answer) => {
          setQuestion("");
          setOpen(true);
          router.refresh();
          triggerAnswerStream(answer);
          return "Success!";
        },
      },
    );
  };

  return (
    <>
      <Modal open={open} setOpen={setOpen}>
        <Label>Dionysus&apos;s Answer</Label>
        <pre className="mt-3 whitespace-pre-wrap p-2 text-sm ">{answer}</pre>
        <Button className="mt-2" onClick={() => setOpen(false)}>
          Thank you Dionysus!
        </Button>
      </Modal>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
          <CardDescription>
            Dionysus has knowledge of the codebase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button isLoading={askQuestion.isLoading} className="mt-4">
              Ask Dionysus!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
