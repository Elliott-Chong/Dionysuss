import { z } from "zod";
import axios from "axios";
import { clerkClient } from "@clerk/nextjs";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { pollRepo } from "@/lib/github";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          users: {
            connect: {
              id: ctx.auth.id,
            },
          },
        },
      });
      return project;
    }),
  getMyProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: {
        users: {
          some: {
            id: ctx.auth.id,
          },
        },
      },
    });
    return projects;
  }),
  linkRepo: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        githubUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      input.githubUrl = input.githubUrl.toLowerCase();
      if (!input.githubUrl.includes("github.com")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid github url",
        });
      }
      const [response] = await Promise.all([
        axios.post(
          `${process.env.PYTHON_AI_BACKEND_URL}/generate_documentation`,
          {
            github_url: input.githubUrl,
          },
        ),
        pollRepo(input.githubUrl, input.projectId),
      ]);

      const project = await ctx.db.project.update({
        where: {
          id: input.projectId,
        },
        data: {
          githubUrl: input.githubUrl,
          documentation: response.data.documentation,
          mermaidGraph: response.data.mermaid,
        },
      });

      return project;
    }),
  saveNote: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.update({
        where: {
          id: input.projectId,
        },
        data: {
          documentation: input.text,
        },
      });
      return project;
    }),
  askQuestion: protectedProcedure
    .input(
      z.object({
        question: z.string(),
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
        },
      });
      if (!project) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }
      if (!project.githubUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Github URL linked to project",
        });
      }
      const { data } = await axios.post(
        `${process.env.PYTHON_AI_BACKEND_URL}/ask`,
        {
          github_url: project.githubUrl,
          query: input.question,
        },
      );
      const answer = data.message;
      await ctx.db.question.create({
        data: {
          answer,
          question: input.question,
          projectId: input.projectId,
          userId: ctx.auth.id,
        },
      });
      return answer as string;
    }),
  deleteQuestion: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.db.question.delete({
        where: {
          id: input.questionId,
        },
      });
      return question;
    }),

  pollCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
        },
      });
      if (!project) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }
      if (!project.githubUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Github URL linked to project",
        });
      }
      await pollRepo(project.githubUrl, input.projectId);
    }),
  processMeeting: protectedProcedure
    .input(
      z.object({
        audio_url: z.string().url(),
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
        },
      });
      if (!project) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }
      const { data } = await axios.post(
        `${process.env.PYTHON_AI_BACKEND_URL}/transcribe-meeting`,
        {
          url: input.audio_url,
        },
      );
      const summaries = data.summaries as any[];
      if (!summaries.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No meeting found",
        });
      }
      const meeting = await ctx.db.meeting.create({
        data: {
          name: summaries[0].gist,
          projectId: input.projectId,
          url: input.audio_url,
        },
      });
      await ctx.db.issue.createMany({
        data: summaries.map((summary) => ({
          start: summary.start,
          end: summary.end,
          gist: summary.gist,
          headline: summary.headline,
          summary: summary.summary,
          meetingId: meeting.id,
        })),
      });

      return { meetingId: meeting.id };
    }),
  deleteMeeting: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.delete({
        where: {
          id: input.meetingId,
        },
      });
      return meeting;
    }),
  askIssue: protectedProcedure
    .input(
      z.object({
        issueId: z.string(),
        query: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const issue = await ctx.db.issue.findUnique({
        where: {
          id: input.issueId,
        },
        include: { meeting: true },
      });
      if (!issue) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Issue not found",
        });
      }

      const { data } = await axios.post(
        `${process.env.PYTHON_AI_BACKEND_URL}/ask-meeting`,
        {
          url: issue.meeting.url,
          quote: issue.summary,
          query: input.query,
        },
      );

      const answer = data.answer;

      return { answer };
    }),
  getUserAvatars: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
        },
      });
      if (!project) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }
      const users = await ctx.db.user.findMany({
        where: {
          projects: {
            some: {
              id: input.projectId,
            },
          },
        },
      });
      const avatars = await Promise.all(
        users.map(async (user) => {
          const clerkUser = await clerkClient.users.getUser(user.id);
          return clerkUser.imageUrl;
        }),
      );
      return avatars;
    }),
});
