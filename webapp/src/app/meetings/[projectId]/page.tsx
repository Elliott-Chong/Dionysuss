import DeleteMeetingButton from "@/components/DeleteMeetingButton";
import MeetingCard from "@/components/MeetingCard";
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

const MeetingsPage = async ({ params: { projectId } }: Props) => {
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
      meetings: {
        include: {
          issues: {
            select: { id: true },
          },
        },
      },
    },
  });
  if (!project) {
    return notFound();
  }
  return (
    <>
      <MeetingCard project={project} />
      <div className="h-6"></div>
      {project.meetings.length > 0 && (
        <h1 className="text-xl font-semibold text-gray-800">All Meetings</h1>
      )}
      <ul role="list" className="divide-y divide-gray-200">
        {project.meetings.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between py-5 gap-x-6"
          >
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <Link
                  href={`/meeting/${meeting.id}`}
                  className="text-sm font-semibold leading-6 text-gray-900 hover:underline"
                >
                  {meeting.name}
                </Link>
              </div>
              <div className="flex items-center mt-1 text-xs leading-5 text-gray-500 gap-x-2">
                <p className="whitespace-nowrap">
                  <time dateTime={meeting.createdAt.toLocaleDateString()}>
                    {meeting.createdAt.toLocaleDateString()}
                  </time>
                </p>
                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <p className="truncate">{meeting.issues.length} issues</p>
              </div>
            </div>
            <div className="flex items-center flex-none gap-x-4">
              <Link
                href={`/meeting/${meeting.id}`}
                className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
              >
                View meeting
              </Link>
              <DeleteMeetingButton meetingId={meeting.id} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default MeetingsPage;
