import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  BookMarked,
  ClipboardList,
  FileText,
  LayoutGrid,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const quickLinks = [
  {
    title: "Exams",
    href: "/self-study/exams",
    description: "Manage exam lists and structure",
    icon: ClipboardList,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    title: "Subjects",
    href: "/self-study/subjects",
    description: "Organize content by subject",
    icon: BookOpen,
    iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Units",
    href: "/self-study/units",
    description: "Content units and hierarchy",
    icon: LayoutGrid,
    iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
] as const;

const mainSections = [
  {
    title: "Self Study",
    href: "/self-study",
    description: "Exams, subjects, units, chapters, topics, definitions & block list",
    icon: BookOpen,
  },
  {
    title: "Syllabus Management",
    href: "/syllabus-management",
    description: "Manage syllabus and curriculum",
    icon: BookMarked,
  },
  {
    title: "Material Management",
    href: "/study-materials",
    description: "Study materials and formula toolkits",
    icon: FileText,
  },
  {
    title: "Practice Management",
    href: "/practice-management",
    description: "Full-length mocks, level-wise & previous year papers",
    icon: ClipboardList,
  },
] as const;

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-0 min-w-0">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1 rounded-lg" aria-label="Toggle sidebar" />
            <Separator orientation="vertical" className="mr-2 h-5 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="min-h-0 flex-1 min-w-0 overflow-auto">
            <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
              {/* Welcome */}
              <section aria-labelledby="dashboard-title">
                <h1 id="dashboard-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Welcome back. Use the shortcuts below or the sidebar to manage your LMS content.
                </p>
              </section>

              {/* Quick links (stat cards as links) */}
              <section aria-labelledby="quick-links-heading">
                <h2 id="quick-links-heading" className="sr-only">
                  Quick links
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {quickLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
                      >
                        <Card className="h-full border-border/80 transition-all hover:border-primary/40 hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {item.title}
                            </span>
                            <div className={`rounded-lg p-2 ${item.iconClass}`}>
                              <Icon className="h-4 w-4" aria-hidden />
                            </div>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-1">
                            <span className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">
                              Open
                              <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </span>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Main sections overview */}
              <section aria-labelledby="overview-heading">
                <Card className="border-border/80">
                  <CardHeader>
                    <CardTitle id="overview-heading">Overview</CardTitle>
                    <CardDescription>
                      Quick access to all admin areas. Click a section to open it.
                    </CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {mainSections.map((section) => {
                        const Icon = section.icon;
                        return (
                          <li key={section.href}>
                            <Link
                              href={section.href}
                              className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/30 p-4 transition-colors hover:bg-muted/50 hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                                <Icon className="h-5 w-5" aria-hidden />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5 font-medium text-foreground">
                                  {section.title}
                                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                </span>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                  {section.description}
                                </p>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
