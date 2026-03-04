"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Layers, FileQuestion, Calendar } from "lucide-react";

const LINKS = [
  {
    title: "Level-Wise (Chapter/Unit/Subject)",
    description: "Create chapter-wise, unit-wise, or subject-wise mock tests by choosing exam and syllabus level.",
    href: "/practice-management/level-wise",
    icon: Layers,
  },
  {
    title: "Full-Length Mocks",
    description: "Create full-length mock tests that simulate the complete exam (e.g. NEET 180Q, JEE 75Q).",
    href: "/practice-management/full-length",
    icon: FileQuestion,
  },
  {
    title: "Previous Year Papers",
    description: "Manage previous year exam papers for students to attempt.",
    href: "/practice-management/previous-years",
    icon: Calendar,
  },
];

export default function PracticeManagementLandingPage() {
  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-5 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/self-study">Self Study</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Practice Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="min-h-0 min-w-0 flex-1 space-y-6 overflow-auto p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mock Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage mock tests: full-length papers, chapter/unit/subject-wise practice, and previous year papers.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {LINKS.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
