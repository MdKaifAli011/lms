"use client"

import dynamic from "next/dynamic"

const LexicalPlayground = dynamic(
  () => import("@/editor/App").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] w-full items-center justify-center rounded-lg border border-border/80 bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading editor…</p>
      </div>
    ),
  }
)

export function LexicalPlaygroundEmbed() {
  return (
    <div className="lexical-playground-embed relative w-full overflow-hidden rounded-b-lg bg-background">
      <LexicalPlayground />
    </div>
  )
}
