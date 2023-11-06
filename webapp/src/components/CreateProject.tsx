"use client";
import React from "react";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import Modal from "./Modal";
import { Input } from "./ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CreateProject = () => {
  const [open, setOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const createProject = api.project.createProject.useMutation();
  const router = useRouter();
  const utils = api.useUtils();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.promise(
      createProject.mutateAsync({
        name: projectName,
      }),
      {
        loading: "Creating project...",
        success: ({ id }) => {
          router.push("/projects/" + id);
          setProjectName("");
          utils.project.getMyProjects.refetch();
          return "Project created!";
        },
        error: "Failed to create project",
      },
    );

    setOpen(false);
  };

  return (
    <>
      <Modal open={open} setOpen={setOpen}>
        <h1 className="text-xl font-semibold">Create a Project</h1>
        <p className="text-sm text-gray-500">
          Enter the name of your project to get started.
        </p>
        <form className="mt-4" onSubmit={handleSubmit}>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
          />
          <Button className="mt-4">Submit</Button>
        </form>
      </Modal>
      <Button
        variant="outline"
        className="mt-2"
        onClick={() => setOpen(true)}
        isLoading={createProject.isLoading}
      >
        <Plus className="mr-1 h-4 w-4" />
        Create a Project
      </Button>
    </>
  );
};

export default CreateProject;
