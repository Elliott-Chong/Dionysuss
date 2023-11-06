import QNA from "@/components/QNA";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";
import React from "react";
type Props = {
  params: {
    projectId: string;
  };
};

const QNAPage = async ({ params: { projectId } }: Props) => {
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
    include: {
      questions: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
        },
      },
    },
  });
  if (!project) {
    return notFound();
  }
  return (
    <div>
      <QNA project={project} />
    </div>
  );
};

export default QNAPage;
