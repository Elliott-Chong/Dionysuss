"use client";
import React from "react";
import { Button } from "./ui/button";
import Modal from "./Modal";
import { Input } from "./ui/input";
import { toast } from "sonner";

type Props = { projectId: string };

const InviteButton = ({ projectId }: Props) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Modal open={open} setOpen={setOpen}>
        <h1 className="text-xl font-semibold text-gray-800">
          Invite a team member!
        </h1>
        <p className="text-sm text-gray-500">
          Ask them to copy and paste this link into their browser:
        </p>
        <Input
          className="mt-4"
          readOnly
          onClick={() => {
            navigator.clipboard.writeText(
              `${process.env.NEXT_PUBLIC_URL}/join/${projectId}`,
            );
            toast.success("Copied to clipboard!");
          }}
          value={`${process.env.NEXT_PUBLIC_URL}/join/${projectId}`}
        />
      </Modal>
      <Button onClick={() => setOpen(true)} variant="outline">
        Invite a team member!
      </Button>
    </>
  );
};

export default InviteButton;
