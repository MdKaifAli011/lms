"use client";

import * as React from "react";
import { X, FileImage, FileVideo, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type FileTypeKind = "image" | "video" | "pdf";

type FileItem = {
  id: string;
  name: string;
  type: "folder" | "file";
  icon: string;
  fileType?: FileTypeKind | null;
  previewUrl?: string | null;
};

export function FilePreviewDialog({
  item,
  open,
  onOpenChange,
}: {
  item: FileItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!item || item.type === "folder") return null;

  const isImage = item.fileType === "image";
  const isVideo = item.fileType === "video";
  const isPdf = item.fileType === "pdf";

  const placeholderUrl = isImage
    ? `https://picsum.photos/800/600?random=${encodeURIComponent(item.id)}`
    : item.previewUrl || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="shrink-0 flex flex-row items-center justify-between gap-2 px-4 py-3 border-b">
          <DialogTitle className="truncate text-base font-medium pr-8">
            {item.name}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex items-center justify-center bg-muted/30 p-4 overflow-auto">
          {isImage && (
            <div className="max-w-full max-h-full flex items-center justify-center">
              <img
                src={placeholderUrl || undefined}
                alt={item.name}
                className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          )}
          {isVideo && (
            <div className="w-full max-w-4xl">
              <video
                src={item.previewUrl || undefined}
                controls
                className="w-full max-h-[80vh] rounded-lg bg-black"
              >
                {!item.previewUrl && (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-8">
                    <FileVideo className="h-16 w-16 opacity-50" />
                    <span>No video source</span>
                  </div>
                )}
              </video>
              {!item.previewUrl && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Add a preview URL to play video.
                </p>
              )}
            </div>
          )}
          {isPdf && (
            <div className="w-full h-full min-h-[60vh] max-w-4xl flex flex-col items-center justify-center gap-4">
              {item.previewUrl ? (
                <iframe
                  src={item.previewUrl}
                  title={item.name}
                  className="w-full h-[80vh] rounded-lg border bg-white"
                />
              ) : (
                <>
                  <FileText className="h-20 w-20 text-red-500/70" />
                  <p className="text-muted-foreground text-center max-w-sm">
                    PDF preview requires a URL. Open the file from your device to view.
                  </p>
                </>
              )}
            </div>
          )}
          {!isImage && !isVideo && !isPdf && (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <FileText className="h-16 w-16 opacity-50" />
              <span>Preview not available</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
