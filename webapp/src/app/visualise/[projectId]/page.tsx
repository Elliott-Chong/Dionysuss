import Mermaid from "@/components/Mermaid";
import QNA from "@/components/QNA";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import React from "react";
type Props = {
  params: {
    projectId: string;
  };
};

const VisualisePage = async ({ params: { projectId } }: Props) => {
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
  if (!project.mermaidGraph) {
    return <div>There is no graph for this project</div>;
  }
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-700">
        This is a{" "}
        <Link
          target="_blank"
          className="underline"
          href={"https://mermaid.js.org/"}
        >
          mermaid
        </Link>{" "}
        flow chart diagram of your code!
      </h1>
      <div className="mt-4 rounded-lg border-2 bg-white shadow-xl">
        <Mermaid project={project} />
      </div>
    </div>
  );
};

export default VisualisePage;
