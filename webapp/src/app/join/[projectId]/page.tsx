import { db } from "@/server/db";
import { auth } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: {
    projectId: string;
  };
};

const JoinPage = async ({ params: { projectId } }: Props) => {
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
    where: {
      id: projectId,
    },
  });
  if (!project) {
    return notFound();
  }
  await db.project.update({
    where: {
      id: projectId,
    },
    data: {
      users: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  return redirect(`/projects/${projectId}`);
};

export default JoinPage;
