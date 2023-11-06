import CopyButton from "@/components/CopyButton";
import IssueCard from "@/components/IssueCard";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs";
import { Presentation } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    meetingId: string;
  };
};

const MeetingPage = async ({ params: { meetingId } }: Props) => {
  const { userId } = await auth();
  const user = await db.user.findUnique({
    where: {
      id: userId ?? "",
    },
  });
  if (!user) {
    return redirect("/register-user");
  }

  const meeting = await db.meeting.findUnique({
    where: { id: meetingId },
    include: {
      issues: true,
    },
  });
  if (!meeting) {
    return notFound();
  }
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b pb-10 lg:mx-0 lg:max-w-none">
          <div className="flex items-center gap-x-6">
            {/* <img
              src="https://tailwindui.com/img/logos/48x48/tuple.svg"
              alt=""
              className="flex-none w-16 h-16 rounded-full ring-1 ring-gray-900/10"
            /> */}
            <div className="rounded-full border bg-white p-3">
              <Presentation className="h-7 w-7 " />
            </div>
            <h1>
              <div className="text-sm leading-6 text-gray-500">
                Meeting on{" "}
                <span className="text-gray-700">
                  {meeting.createdAt.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
                {meeting.name}
              </div>
            </h1>
          </div>
          <div className="flex items-center gap-x-4 sm:gap-x-6">
            <CopyButton />
          </div>
        </div>
        <div className="h-4"></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {meeting.issues.map((issue) => {
            return <IssueCard issue={issue} key={issue.id} />;
          })}
        </div>
      </div>
    </>
  );
};

export default MeetingPage;
