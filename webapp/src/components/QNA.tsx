"use client";
import { PlusSmallIcon } from "@heroicons/react/24/outline";
import type { Project, Question, User } from "@prisma/client";
import React from "react";
import Modal from "./Modal";
import { useAtom } from "jotai";
import { projectAtom } from "./ApplicationShell";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AskQuestionCard from "./AskQuestionCard";

type Props = {
  project: Project & {
    questions: (Question & { user: User })[];
  };
};

export default function QNA({ project }: Props) {
  const [open, setOpen] = React.useState(false);
  const [question, setQuestion] = React.useState<Question | null>(null);
  const deleteQuestion = api.project.deleteQuestion.useMutation();
  const [_, setProject] = useAtom(projectAtom);
  const router = useRouter();
  React.useEffect(() => {
    setProject(project);
  }, [project]);
  return (
    <>
      <Modal open={open} setOpen={setOpen}>
        {question && (
          <div>
            <h1>
              <span className="font-semibold">Question:</span>{" "}
              {question.question}
            </h1>
            <div className="h-2"></div>
            <div>
              <span className="font-semibold">Answer:</span>

              <pre className="whitespace-pre-wrap text-sm">
                {question.answer}
              </pre>
            </div>
            <Button
              className="mt-4"
              onClick={() => {
                setOpen(false);
              }}
            >
              Thank you Dionysus!
            </Button>
          </div>
        )}
      </Modal>
      <div className="">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl divide-y divide-gray-300">
            {project.questions.length === 0 ? (
              <AskQuestionCard projectId={project.id} />
            ) : (
              <>
                <h2 className="text-2xl font-bold leading-10 tracking-tight">
                  Question Logs
                </h2>
                <dl className="mt-10 space-y-6 divide-y divide-gray-300">
                  {project.questions.map((question) => (
                    <div
                      onClick={() => {
                        setQuestion(question);
                        setOpen(true);
                      }}
                      key={question.question}
                      className="pt-6"
                    >
                      <>
                        <dt>
                          <div className="flex w-full cursor-pointer items-start justify-between text-left">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">
                                {question.createdAt.toLocaleTimeString()}
                              </span>
                              <span className="text-sm text-gray-800">
                                {question.user.name}
                              </span>
                              <span className="text-base font-semibold leading-7">
                                {question.question}
                              </span>
                            </div>
                            <span className="ml-6 flex items-center">
                              <PlusSmallIcon className="h-6 w-6" />
                              <Trash2
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const confirm = window.confirm(
                                    "Are you sure you want to delete this question?",
                                  );
                                  if (!confirm) return;
                                  toast.promise(
                                    deleteQuestion.mutateAsync({
                                      questionId: question.id,
                                    }),
                                    {
                                      loading: "Deleting...",
                                      error: "Failed to delete question",
                                      success: () => {
                                        router.refresh();
                                        return "Deleted!";
                                      },
                                    },
                                  );
                                }}
                                className="ml-2 h-5 w-5 text-red-600"
                              />
                            </span>
                          </div>
                        </dt>
                      </>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
