"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Highlighter,
  Type,
  RemoveFormatting,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const FONT_SIZES = [12, 14, 16, 18, 20, 24]
const TEXT_COLORS = [
  "#000000",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#2563eb",
  "#9333ea",
  "#db2777",
  "#64748b",
]

export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  className,
  minHeight = "80px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [colorOpen, setColorOpen] = useState(false)
  const [highlightOpen, setHighlightOpen] = useState(false)

  const isControlled = value !== undefined

  // Sync initial/external value into editor (e.g. when dialog opens)
  useEffect(() => {
    const el = editorRef.current
    if (!el || !isControlled) return
    const next = value || ""
    if (el.innerHTML !== next) el.innerHTML = next
  }, [isControlled, value])

  const emitChange = useCallback(() => {
    const el = editorRef.current
    if (el) onChange(el.innerHTML)
  }, [onChange])

  const exec = useCallback(
    (cmd: string, value?: string) => {
      document.execCommand(cmd, false, value ?? undefined)
      editorRef.current?.focus()
      emitChange()
    },
    [emitChange]
  )

  const handleInput = useCallback(() => {
    emitChange()
  }, [emitChange])

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const text = e.clipboardData.getData("text/plain")
      document.execCommand("insertText", false, text)
      emitChange()
    },
    [emitChange]
  )

  return (
    <div className={cn("rounded-lg border border-border bg-background overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs font-medium">
              <span id="font-size-label">14</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[80px]">
            {FONT_SIZES.map((n) => (
              <DropdownMenuItem
                key={n}
                onSelect={() => exec("fontSize", String(Math.min(7, Math.max(1, Math.round((n - 10) / 2)))))}
              >
                {n}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="h-4 w-px bg-border mx-0.5" aria-hidden />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("underline")} title="Underline">
          <Underline className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("strikeThrough")} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </Button>
        <span className="h-4 w-px bg-border mx-0.5" aria-hidden />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("justifyLeft")} title="Align left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("justifyCenter")} title="Align center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("justifyRight")} title="Align right">
          <AlignRight className="h-4 w-4" />
        </Button>
        <span className="h-4 w-px bg-border mx-0.5" aria-hidden />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("insertUnorderedList")} title="Bullet list">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("insertOrderedList")} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <span className="h-4 w-px bg-border mx-0.5" aria-hidden />
        <DropdownMenu open={highlightOpen} onOpenChange={setHighlightOpen}>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Highlight">
              <Highlighter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="p-2">
            <div className="grid grid-cols-4 gap-1">
              {["#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8"].map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-6 w-6 rounded border border-border"
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    exec("hiliteColor", c)
                    setHighlightOpen(false)
                  }}
                  aria-label={`Highlight ${c}`}
                />
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu open={colorOpen} onOpenChange={setColorOpen}>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Text color">
              <Type className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="p-2">
            <div className="grid grid-cols-4 gap-1">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    exec("foreColor", c)
                    setColorOpen(false)
                  }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="h-4 w-px bg-border mx-0.5" aria-hidden />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("removeFormat")} title="Clear formatting">
          <RemoveFormatting className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        className={cn(
          "min-w-0 p-3 text-sm outline-none",
          "[&:empty::before]:content-[attr(data-placeholder)] [&:empty::before]:text-muted-foreground",
          "[&_ul]:block [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:ml-1",
          "[&_ol]:block [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-6 [&_ol]:my-2 [&_ol]:ml-1",
          "[&_li]:block [&_li]:my-0.5 [&_li]:pl-1"
        )}
        style={{ minHeight }}
        onInput={handleInput}
        onPaste={handlePaste}
        suppressContentEditableWarning
      />
    </div>
  )
}
