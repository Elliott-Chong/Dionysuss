"use client";
import { PlusIcon, Presentation, Upload } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { useAtom } from "jotai";
import { projectAtom } from "./ApplicationShell";
import { Project } from "@prisma/client";
import { uploadFileToFirebase } from "@/lib/storage";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = { project: Project };

const MeetingCard = ({ project }: Props) => {
  const processMeeting = api.project.processMeeting.useMutation();
  const [isUploading, setIsUploading] = React.useState(false);
  const router = useRouter();
  const { getRootProps, getInputProps } = useDropzone({
    // only accept audio files
    accept: {
      "audio/*":
        ".mp3,.m4a,.wav,.flac,.ogg,.aac,.opus,.wma,.webm,.amr,.3gp,.mp2,.m2a,.m4b,.m4p,.mpc,.mpga,.oga,.spx,.wv,.mka,.m3u,.m3u8,.m4u".split(
          ",",
        ),
    },
    // 50mb
    maxSize: 50000000,
    onDrop: (acceptedFiles) => {
      (async () => {
        setIsUploading(true);
        try {
          const file = acceptedFiles[0];
          if (file instanceof File) {
            const downloadUrl = await uploadFileToFirebase(file, file.name);
            toast.promise(
              processMeeting.mutateAsync({
                audio_url: downloadUrl,
                projectId: project.id,
              }),
              {
                loading: "Processing meeting...",
                success: ({ meetingId }) => {
                  router.push("/meeting/" + meetingId);
                  return "Meeting processed!";
                },
                error: "Failed to process meeting",
                finally: () => {
                  setIsUploading(false);
                },
              },
            );
          }
        } catch (error) {
          console.error(error);
        } finally {
        }
      })();
    },
  });
  const [_, setProject] = useAtom(projectAtom);
  React.useEffect(() => {
    setProject(project);
  }, [project]);

  return (
    <>
      <div
        {...getRootProps()}
        className="col-span-2 flex flex-col items-center justify-center rounded-lg border bg-white p-10"
      >
        <Presentation className="h-10 w-10 animate-bounce" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          Create a new meeting
        </h3>
        <p className="mt-1 text-center text-sm text-gray-500">
          Analyse your meeting with Dionysus.
          <br />
          Powered by AI.
        </p>
        <div className="mt-6">
          <Button isLoading={isUploading}>
            <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Upload Meeting
            <input {...getInputProps()} />
          </Button>
        </div>
        {isUploading && (
          <p className="mt-3 text-center text-xs text-gray-500">
            Uploading and processing meeting... <br />
            This may take a few minutes...
          </p>
        )}
      </div>
    </>
  );
};

export default MeetingCard;
