"use client";
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import TipTapMenuBar from "./TipTapMenuBar";
import { Button } from "./ui/button";
import type { Project } from "@prisma/client";
import { api } from "@/trpc/react";
import { useDebounce } from "./useDebounce";
import { useAtom } from "jotai";
import { projectAtom } from "./ApplicationShell";

type Props = { project: Project };

const TipTapEditor = ({ project }: Props) => {
  const [_, setProject] = useAtom(projectAtom);
  React.useEffect(() => {
    setProject(project);
  }, [project]);
  const saveEditor = api.project.saveNote.useMutation();
  const [editorState, setEditorState] = React.useState(
    project.documentation || "",
  );
  const debouncedEditorState = useDebounce(editorState, 500);
  React.useEffect(() => {
    saveEditor.mutate({
      projectId: project.id,
      text: debouncedEditorState,
    });
  }, [debouncedEditorState]);
  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit],
    content: editorState,
    onUpdate: ({ editor }) => {
      setEditorState(editor.getHTML());
    },
  });
  return (
    <>
      <div className="flex">
        {editor && <TipTapMenuBar editor={editor} />}
        <Button disabled variant={"outline"} className="ml-auto">
          {saveEditor.isLoading ? "Saving..." : "Saved"}
        </Button>
      </div>

      <div className="prose mt-4 w-full max-w-none">
        <EditorContent editor={editor} />
      </div>
    </>
  );
};

export default TipTapEditor;
