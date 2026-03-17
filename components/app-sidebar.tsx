"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookMarked, BookOpen, ClipboardList, FileText } from "lucide-react";

import { Logo } from "@/components/logo";
import { NavMain } from "@/components/nav-main";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// LMS Navigation Data
const data = {
  navMain: [
    {
      title: "Self Study",
      url: "/self-study",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Exams",
          url: "/self-study/exams",
        },
        {
          title: "Subjects",
          url: "/self-study/subjects",
        },
        {
          title: "Units",
          url: "/self-study/units",
        },
        {
          title: "Chapters",
          url: "/self-study/chapters",
        },
        {
          title: "Topics",
          url: "/self-study/topics",
        },
        {
          title: "Sub Topics",
          url: "/self-study/sub-topics",
        },
        {
          title: "Definitions",
          url: "/self-study/definitions",
        },
        {
          title: "Visit Block List",
          url: "/self-study/blocked-ips",
        },
      ],
    },
    {
      title: "Syllabus Management",
      url: "/syllabus-management",
      icon: BookMarked,
      items: [
        {
          title: "Syllabus",
          url: "/syllabus-management/syllabus",
        },
      ],
    },
    {
      title: "Material Management",
      url: "/study-materials",
      icon: FileText,
      items: [
        {
          title: "Formula Toolkits",
          url: "/study-materials/formula-toolkits",
        },
      ],
    },
    {
      title: "Practice Management",
      url: "/practice-management",
      icon: ClipboardList,
      items: [
        {
          title: "Full-Length Mocks",
          url: "/practice-management/full-length",
        },
        {
          title: "Level-Wise (Chapter/Unit/Subject)",
          url: "/practice-management/level-wise",
        },
        {
          title: "Level-Wise Flashcards",
          url: "/practice-management/flashcards",
        },
        {
          title: "Previous Year Papers",
          url: "/practice-management/previous-years",
        },
      ],
    },
   
  ],
};

function SidebarLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 rounded-md outline-none ring-sidebar-ring focus-visible:ring-2"
        >
          {/* Expanded: Logo component (SVG). Collapsed: image logo. */}
          {isCollapsed ? (
            <Image
              src="/logo.png"
              alt="LMS Doors"
              width={32}
              height={32}
              className="size-8 shrink-0 object-contain"
            />
          ) : (
            <>
              <Logo
                width={180}
                height={60}
                className="h-12 w-auto shrink-0"
              />
            </>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} hidden={!isCollapsed}>
        LMS Doors
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <SidebarLogo />
          <div className="shrink-0 group-data-[collapsible=icon]:hidden">
            <ThemeToggle />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
