import TipTapEditor from "@/components/TipTapEditor";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    projectId: string;
  };
};

const DocumentationPage = async ({ params: { projectId } }: Props) => {
  const { userId } = await auth();
  const user = await db.user.findUnique({
    where: {
      id: userId ?? "",
    },
  });
  if (!user) {
    return redirect("/register-user");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
  });
  if (!project) {
    return notFound();
  }
  return (
    <>
      <div className="rounded-lg p-4 shadow-xl">
        <TipTapEditor project={project} />
      </div>
    </>
  );
};

export default DocumentationPage;
