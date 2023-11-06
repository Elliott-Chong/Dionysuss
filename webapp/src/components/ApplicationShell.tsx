"use client";
import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import {
  BookText,
  FileQuestion,
  FolderTree,
  Home,
  MenuIcon,
  Presentation,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";
import { UserButton } from "@clerk/nextjs";
import CreateProject from "./CreateProject";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/trpc/react";
import { Skeleton } from "./ui/skeleton";
import { atom, useAtom } from "jotai";
import { Project } from "@prisma/client";
import { useRouter } from "next/router";

const publicRoutes = ["/sign-up", "/sign-in"];

export const projectAtom = atom<Project | null>(null);

export default function ApplicationShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [project] = useAtom(projectAtom);

  const navigation = [
    {
      name: "Home",
      href: "/projects/" + project?.id,
      current: false,
      icon: Home,
    },
    {
      name: "Documentation",
      href: "/documentation/" + project?.id,
      current: false,
      icon: BookText,
    },
    {
      name: "Q & A",
      href: "/qna/" + project?.id,
      current: false,
      icon: FileQuestion,
    },
    {
      name: "Meetings",
      href: "/meetings/" + project?.id,
      current: false,
      icon: Presentation,
    },
    {
      name: "Files Visualisation",
      href: "/visualise/" + project?.id,
      current: false,
      icon: FolderTree,
    },
  ];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: projects, isLoading } = api.project.getMyProjects.useQuery();

  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="grainy">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <X className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
                    <div className="flex h-16 shrink-0 items-center">
                      <Logo />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <Logo />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {project &&
                      navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={cn(
                              pathname.includes(item.href)
                                ? "bg-gray-800 text-white"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white",
                              "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                            )}
                          >
                            <item.icon
                              className="h-6 w-6 shrink-0"
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold leading-6 text-gray-400">
                    Your Projects
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {isLoading &&
                      [1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-8 bg-gray-800" />
                      ))}
                    {projects?.map((project) => (
                      <li key={project.name}>
                        <Link
                          href={`/projects/${project.id}`}
                          className={cn(
                            pathname === `/projects/${project.id}`
                              ? "bg-gray-800 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white",
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                          )}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                            {project.name[0]}
                          </span>
                          <span className="truncate">{project.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <CreateProject />
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div
              className="h-6 w-px bg-gray-900/10 lg:hidden"
              aria-hidden="true"
            />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <UserButton afterSignOutUrl="/sign-up" />
              </div>
            </div>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
