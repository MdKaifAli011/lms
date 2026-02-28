"use client"

import { Button } from "@/components/ui/button"
import { Loader2, MoreVertical } from "lucide-react"

type SaveStatus = "idle" | "saving" | "saved"

type LastModifiedCreatedBarProps = {
  lastModified?: string | null
  createdAt?: string | null
  onSave: () => void
  saveStatus: SaveStatus
  saveButtonLabel?: string
  /** Optional more-actions button (e.g. dropdown) */
  moreButton?: React.ReactNode
}

export function LastModifiedCreatedBar({
  lastModified,
  createdAt,
  onSave,
  saveStatus,
  saveButtonLabel = "Save Changes",
  moreButton,
}: LastModifiedCreatedBarProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-bold uppercase tracking-tighter">Last Modified:</span>
          <span className="text-foreground">{lastModified ?? "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-bold uppercase tracking-tighter">Created:</span>
          <span className="text-foreground">{createdAt ?? "—"}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
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
      </div>
    </div>
  )
}
