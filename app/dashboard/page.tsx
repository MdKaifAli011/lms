import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  BookOpen,
  ClipboardList,
  LayoutGrid,
} from "lucide-react"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-0 min-w-0">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1 rounded-lg" />
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
            <div className="flex flex-1 flex-col gap-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border-border/80 transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Exams</span>
                    <div className="rounded-lg bg-primary/10 p-2">
                      <ClipboardList className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">—</p>
                    <p className="text-xs text-muted-foreground">Manage exam lists</p>
                  </CardContent>
                </Card>
                <Card className="border-border/80 transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Subjects</span>
                    <div className="rounded-lg bg-emerald-500/10 p-2">
                      <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">—</p>
                    <p className="text-xs text-muted-foreground">Organize by subject</p>
                  </CardContent>
                </Card>
                <Card className="border-border/80 transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Units</span>
                    <div className="rounded-lg bg-violet-500/10 p-2">
                      <LayoutGrid className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">—</p>
                    <p className="text-xs text-muted-foreground">Content units</p>
                  </CardContent>
                </Card>
              </div>
              <Card className="border-border/80">
                <CardHeader>
                  <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
                  <p className="text-sm text-muted-foreground">Quick access and activity summary.</p>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30 text-muted-foreground">
                    <p className="text-sm">Overview content can go here.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
