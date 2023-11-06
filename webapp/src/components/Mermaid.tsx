"use client";
import type { Project } from "@prisma/client";
import { useAtom } from "jotai";
import React from "react";
import Mermaid from "react-mermaid2";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { projectAtom } from "./ApplicationShell";
type Props = {
  project: Project;
};

const MermaidDiagram = ({ project }: Props) => {
  const [_, setProject] = useAtom(projectAtom);
  React.useEffect(() => {
    setProject(project);
  }, [project]);
  return (
    <>
      <TransformWrapper initialScale={6} initialPositionY={-260}>
        <TransformComponent
          contentStyle={{
            height: "50vh",
            cursor: "grab",
          }}
        >
          <Mermaid chart={project.mermaidGraph} />
        </TransformComponent>
      </TransformWrapper>
    </>
  );
};

export default MermaidDiagram;
