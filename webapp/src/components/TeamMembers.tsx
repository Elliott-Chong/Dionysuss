import type { User } from "@prisma/client";
import React from "react";
import { api } from "@/trpc/server";

type Props = {
  projectId: string;
  users: User[];
};

const TeamMembers = async ({ projectId, users }: Props) => {
  const avatars = await api.project.getUserAvatars.query({
    projectId,
  });
  return (
    <>
      <div className="flex -space-x-2 overflow-hidden">
        {users.map((user, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={user.id}
            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
            src={avatars[index]}
            alt="user profile"
          />
        ))}
      </div>
    </>
  );
};

export default TeamMembers;
