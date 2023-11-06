import AddRepo from "@/components/AddRepo";
import ApplicationShell from "@/components/ApplicationShell";
import CreateProject from "@/components/CreateProject";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function Index() {
  const { userId } = await auth();
  const user = await db.user.findUnique({
    where: {
      id: userId ?? "",
    },
  });
  if (!user) {
    return redirect("/register-user");
  }
  const projects = await db.project.findMany({
    where: {
      users: {
        some: {
          id: user.id,
        },
      },
    },
  });
  if (projects.length === 0) {
    return (
      <>
        <h1 className="text-2xl font-semibold text-gray-700">
          Begin by creating a new project!
        </h1>
        <CreateProject />
      </>
    );
  } else {
    return redirect("/projects/" + projects[0]!.id);
  }
}
