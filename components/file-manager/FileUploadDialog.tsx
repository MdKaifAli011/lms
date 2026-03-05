"use client";

import * as React from "react";
import { Upload, X, FileImage, FileVideo, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ACCEPT_IMAGE = "image/*";
const ACCEPT_VIDEO = "video/*";
const ACCEPT_PDF = ".pdf,application/pdf";
export const UPLOAD_ACCEPT = `${ACCEPT_IMAGE},${ACCEPT_VIDEO},${ACCEPT_PDF}`;

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function isAcceptedFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type.startsWith("image/")) return true;
  if (type.startsWith("video/")) return true;
  if (type === "application/pdf") return true;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return true;
  return false;
}

function getFileCategory(file: File): "image" | "video" | "pdf" {
  const type = file.type.toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  return "pdf";
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

export function FileUploadDialog({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [rejectedCount, setRejectedCount] = React.useState(0);
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
    if (!value) {
      setRejectedCount(0);
    }
  };

  const processFileList = (list: FileList | null) => {
    if (!list?.length) return;
    const accepted: File[] = [];
    let rejected = 0;
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      if (!isAcceptedFile(file)) {
        rejected++;
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        rejected++;
        continue;
      }
      accepted.push(file);
    }
    setFiles((prev) => [...prev, ...accepted]);
    setRejectedCount((r) => r + rejected);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    processFileList(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFileList(e.target.files);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    setOpen(false);
    setFiles([]);
    setRejectedCount(0);
  };

  const FileIcon = ({ category }: { category: "image" | "video" | "pdf" }) => {
    const C = category === "image" ? FileImage : category === "video" ? FileVideo : FileText;
    const color = category === "image" ? "text-emerald-600" : category === "video" ? "text-blue-600" : "text-red-600";
    return <C className={cn("h-4 w-4 shrink-0", color)} />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md overflow-hidden min-w-0">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            Images, videos and PDFs only. Max {MAX_SIZE_MB} MB per file.
          </DialogDescription>
        </DialogHeader>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-border bg-muted/30"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={UPLOAD_ACCEPT}
            className="hidden"
            id="file-manager-upload"
            onChange={handleChange}
          />
          <label
            htmlFor="file-manager-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-10 w-10 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Upload images, videos or PDFs</span>
            <span className="text-xs text-muted-foreground">or drag and drop</span>
            <span className="text-[11px] text-muted-foreground">
              PNG, JPG, GIF, WebP · MP4, WebM · PDF (max {MAX_SIZE_MB} MB)
            </span>
          </label>
        </div>

        {rejectedCount > 0 && (
          <p className="text-xs text-destructive font-medium">
            {rejectedCount} file(s) skipped — only images, videos and PDFs are allowed.
          </p>
        )}

        {files.length > 0 && (
          <div className="space-y-2 min-w-0 overflow-hidden">
            <p className="text-sm font-medium">Selected files</p>
            <ul className="max-h-44 overflow-auto space-y-1.5 rounded-md border p-2 min-w-0">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 min-w-0 overflow-hidden text-sm rounded-md bg-muted/50 px-2 py-1.5"
                >
                  <FileIcon category={getFileCategory(file)} />
                  <span className="truncate min-w-0 flex-1" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs whitespace-nowrap tabular-nums">
                    {formatSize(file.size)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => removeFile(index)}
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload}>Start upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
