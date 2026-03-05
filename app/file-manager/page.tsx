"use client";

import { FileManager } from "@/components/file-manager/FileManager";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function FileManagerPage() {
  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-5 data-[orientation=vertical]:h-4" />
        <h1 className="text-lg font-semibold">File Manager</h1>
      </header>
      <div className="min-h-0 min-w-0 flex-1">
        <FileManager />
      </div>
    </div>
  );
}
