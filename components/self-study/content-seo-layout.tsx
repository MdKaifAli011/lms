"use client"

import type { ReactNode } from "react"

type ContentSeoLayoutProps = {
  /** Main content (e.g. ContentEditorCard or custom content) */
  content: ReactNode
  /** Right sidebar content (e.g. SEO Settings form) */
  seoSidebar: ReactNode
}

export function ContentSeoLayout({ content, seoSidebar }: ContentSeoLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background">
      <div className="min-h-0 flex-1 overflow-y-auto bg-background p-6 [scrollbar-gutter:stable]">
        <div className="mx-auto max-w-5xl space-y-6">
          {content}
        </div>
      </div>
      <aside className="flex h-full w-80 shrink-0 flex-col overflow-y-auto border-l border-border bg-card no-scrollbar">
        <div className="p-6">
          <h3 className="mb-6 text-base font-bold">SEO Settings</h3>
          {seoSidebar}
        </div>
      </aside>
    </div>
  )
}
