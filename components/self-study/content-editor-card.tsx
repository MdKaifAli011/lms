"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LexicalPlaygroundEmbed } from "@/components/lexical-playground-embed"

export function ContentEditorCard() {
  return (
    <Card className="overflow-hidden border border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border/80 p-6 pb-3">
        <CardTitle className="text-lg font-bold">Content Editor</CardTitle>
        <CardDescription className="mt-1 text-xs text-muted-foreground">
          Rich content editor with toolbar, tables, images, and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[500px] p-0">
        <div className="min-h-[480px] w-full">
          <LexicalPlaygroundEmbed />
        </div>
      </CardContent>
    </Card>
  )
}
