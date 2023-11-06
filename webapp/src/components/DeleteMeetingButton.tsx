"use client";
import React from "react";
import { Trash2 } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = { meetingId: string };

const DeleteMeetingButton = ({ meetingId }: Props) => {
  const deleteMeeting = api.project.deleteMeeting.useMutation();
  const router = useRouter();
  return (
    <Trash2
      className="h-5 w-5 cursor-pointer text-red-600"
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to delete this meeting? This action cannot be undone.",
        );
        if (!confirm) return;
        toast.promise(deleteMeeting.mutateAsync({ meetingId }), {
          loading: "Deleting meeting...",
          success: () => {
            router.refresh();
            return "Meeting deleted!";
          },
          error: "Failed to delete meeting",
        });
      }}
    />
  );
};

export default DeleteMeetingButton;
