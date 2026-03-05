"use client";

import { useState, useEffect } from "react";
import { Trash2, RotateCcw, X, FileImage, FileVideo, FileText, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type TrashedEntry = {
  item: { id: string; name: string; type: string; icon: string; [key: string]: unknown };
  originalPath: string[];
};

type FileItem = TrashedEntry["item"];

function getFileIcon(icon: string, className?: string) {
  const base = "h-5 w-5 shrink-0";
  switch (icon) {
    case "folder":
      return <Folder className={cn(base, "text-amber-500", className)} />;
    case "image":
      return <FileImage className={cn(base, "text-emerald-600", className)} />;
    case "video":
      return <FileVideo className={cn(base, "text-blue-600", className)} />;
    case "pdf":
      return <FileText className={cn(base, "text-red-600", className)} />;
    default:
      return <FileText className={cn(base, "text-muted-foreground", className)} />;
  }
}

export function TrashBinDialog({
  open,
  onOpenChange,
  trash,
  onRestore,
  onRestoreMany,
  onPermanentDelete,
  onPermanentDeleteMany,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trash: TrashedEntry[];
  onRestore: (entry: TrashedEntry) => void;
  onRestoreMany?: (entries: TrashedEntry[]) => void;
  onPermanentDelete: (entry: TrashedEntry) => void;
  onPermanentDeleteMany?: (entries: TrashedEntry[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmPermanentOpen, setConfirmPermanentOpen] = useState(false);
  const [pendingPermanentEntries, setPendingPermanentEntries] = useState<TrashedEntry[]>([]);

  const selectedCount = selectedIds.size;
  const allSelected = trash.length > 0 && selectedCount === trash.length;

  useEffect(() => {
    if (!open) setSelectedIds(new Set());
  }, [open]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(trash.map((e) => e.item.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRestoreSelected = () => {
    const toRestore = trash.filter((e) => selectedIds.has(e.item.id));
    if (toRestore.length > 1 && onRestoreMany) {
      onRestoreMany(toRestore);
    } else {
      toRestore.forEach((entry) => onRestore(entry));
    }
    setSelectedIds(new Set());
  };

  const openPermanentConfirm = (entries: TrashedEntry[]) => {
    setPendingPermanentEntries(entries);
    setConfirmPermanentOpen(true);
  };

  const confirmPermanentDelete = () => {
    const toDelete = [...pendingPermanentEntries];
    if (toDelete.length > 1 && onPermanentDeleteMany) {
      onPermanentDeleteMany(toDelete);
    } else {
      toDelete.forEach((entry) => onPermanentDelete(entry));
    }
    setPendingPermanentEntries([]);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      toDelete.forEach((e) => next.delete(e.item.id));
      return next;
    });
    setConfirmPermanentOpen(false);
  };

  const cancelPermanentConfirm = () => {
    setPendingPermanentEntries([]);
    setConfirmPermanentOpen(false);
  };

  const handlePermanentDeleteOne = (entry: TrashedEntry) => {
    openPermanentConfirm([entry]);
  };

  const handlePermanentDeleteSelected = () => {
    const toDelete = trash.filter((e) => selectedIds.has(e.item.id));
    if (toDelete.length === 0) return;
    openPermanentConfirm(toDelete);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-muted-foreground" />
              Trash
            </DialogTitle>
            <DialogDescription>
              Deleted items stay here until you restore or permanently delete them.
            </DialogDescription>
          </DialogHeader>

          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 border rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-sm font-medium">{selectedCount} selected</span>
              <Button variant="outline" size="sm" className="gap-1" onClick={handleRestoreSelected}>
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handlePermanentDeleteSelected}
              >
                <X className="h-3.5 w-3.5" />
                Delete permanently
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Clear selection
              </Button>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-auto border rounded-lg">
            {trash.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Trash2 className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">Trash is empty</p>
              </div>
            ) : (
              <ul className="divide-y">
                {trash.length > 0 && (
                  <li className="flex items-center gap-3 px-4 py-2 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
                    <div className="w-8 shrink-0">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </div>
                    <div className="flex-1 min-w-0">Name</div>
                    <div className="shrink-0 w-[200px]">Actions</div>
                  </li>
                )}
                {trash.map((entry) => (
                  <li
                    key={entry.item.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 hover:bg-muted/50",
                      selectedIds.has(entry.item.id) && "bg-muted/50"
                    )}
                  >
                    <div className="w-8 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(entry.item.id)}
                        onCheckedChange={() => toggleOne(entry.item.id)}
                      />
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                      {getFileIcon(entry.item.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{entry.item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        From: {entry.originalPath.length ? entry.originalPath.join(" / ") : "Root"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => onRestore(entry)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handlePermanentDeleteOne(entry)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Delete permanently
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmPermanentOpen} onOpenChange={(open) => !open && cancelPermanentConfirm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete permanently?</DialogTitle>
            <DialogDescription>
              {pendingPermanentEntries.length === 1
                ? `"${pendingPermanentEntries[0]?.item.name}" will be permanently removed. This action cannot be undone.`
                : `${pendingPermanentEntries.length} item(s) will be permanently removed. This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={cancelPermanentConfirm}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmPermanentDelete}>
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
