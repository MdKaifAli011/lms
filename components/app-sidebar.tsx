"use client";

import * as React from "react";
import { BookMarked, BookOpen, ClipboardList, FileText } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

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
      title: "Mock Management",
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
          title: "Previous Year Papers",
          url: "/practice-management/previous-years",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-semibold">LMS Doors</span>
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
