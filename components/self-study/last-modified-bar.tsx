"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, MoreVertical, ChevronDown, Globe, GlobeLock } from "lucide-react"

type SaveStatus = "idle" | "saving" | "saved"

type LastModifiedCreatedBarProps = {
  lastModified?: string | null
  createdAt?: string | null
  onSave: () => void
  saveStatus: SaveStatus
  saveButtonLabel?: string
  /** Optional more-actions button (e.g. dropdown). Ignored when publish props are provided. */
  moreButton?: React.ReactNode
  /** When false, the "Created" line is not shown. Default true. */
  showCreated?: boolean
  /** Publish = allow index & follow (noIndex false, noFollow false). Unpublish = no index, no follow. */
  noIndex?: boolean
  noFollow?: boolean
  onPublishChange?: (noIndex: boolean, noFollow: boolean) => Promise<void>
  publishSaving?: boolean
}

export function LastModifiedCreatedBar({
  lastModified,
  createdAt,
  onSave,
  saveStatus,
  saveButtonLabel = "Save Changes",
  moreButton,
  showCreated = true,
  noIndex = false,
  noFollow = false,
  onPublishChange,
  publishSaving = false,
}: LastModifiedCreatedBarProps) {
  const isPublished = !noIndex && !noFollow

  const rightSection =
    onPublishChange != null ? (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-md px-3 py-2 text-xs font-semibold"
              disabled={publishSaving}
            >
              {publishSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : isPublished ? (
                <Globe className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              ) : (
                <GlobeLock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              )}
              {publishSaving ? "Updating…" : isPublished ? "Published" : "Unpublished"}
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            <DropdownMenuItem
              onClick={() => onPublishChange(false, false)}
              disabled={publishSaving || isPublished}
              className="gap-2"
            >
              <Globe className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              <span className="flex flex-col items-start">
                <span>Publish</span>
                <span className="text-muted-foreground text-xs font-normal">Allow index & follow</span>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onPublishChange(true, true)}
              disabled={publishSaving || !isPublished}
              className="gap-2"
            >
              <GlobeLock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="flex flex-col items-start">
                <span>Unpublish</span>
                <span className="text-muted-foreground text-xs font-normal">No index, no follow</span>
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="sm"
          className="rounded-md px-5 py-2 text-xs font-semibold shadow-lg shadow-primary/10"
          onClick={onSave}
          disabled={saveStatus === "saving"}
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden />
              Saving…
            </>
          ) : saveStatus === "saved" ? (
            "Saved"
          ) : (
            saveButtonLabel
          )}
        </Button>
      </>
    ) : (
      <>
        <Button
          size="sm"
          className="rounded-md px-5 py-2 text-xs font-semibold shadow-lg shadow-primary/10"
          onClick={onSave}
          disabled={saveStatus === "saving"}
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden />
              Saving…
            </>
          ) : saveStatus === "saved" ? (
            "Saved"
          ) : (
            saveButtonLabel
          )}
        </Button>
        {moreButton ?? (
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-md">
            <MoreVertical className="h-5 w-5" />
          </Button>
        )}
      </>
    )

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-bold uppercase tracking-tighter">Last Modified:</span>
          <span className="text-foreground">{lastModified ?? "—"}</span>
        </div>
        {showCreated && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-bold uppercase tracking-tighter">Created:</span>
            <span className="text-foreground">{createdAt ?? "—"}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {rightSection}
      </div>
    </div>
  )
}
