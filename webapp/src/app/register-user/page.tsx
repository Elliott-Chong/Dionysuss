import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const RegisterUser = async () => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-up");
  }
  const [user, dbUser] = await Promise.all([
    clerkClient.users.getUser(userId),
    db.user.findUnique({
      where: { id: userId },
    }),
  ]);

  if (!dbUser) {
    await db.user.create({
      data: {
        id: userId,
        name: user.firstName + " " + user.lastName,
      },
    });
  }
  return redirect("/");
};

export default RegisterUser;
