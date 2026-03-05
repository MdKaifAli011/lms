"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Folder,
  FileImage,
  FileVideo,
  FileText,
  Home,
  Upload,
  FolderPlus,
  ChevronDown,
  MoreHorizontal,
  X,
  LayoutGrid,
  List,
  Search,
  Share2,
  Copy,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileUploadDialog } from "./FileUploadDialog";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { FilePreviewDialog } from "./FilePreviewDialog";
import { TrashBinDialog, type TrashedEntry } from "./TrashBinDialog";
import fileManagerData from "./data.json";
import { toast } from "sonner";

type FileTypeKind = "image" | "video" | "pdf";

type FileItem = {
  id: string;
  name: string;
  type: "folder" | "file";
  icon: string;
  fileType?: FileTypeKind | null;
  date: string;
  size: string;
  owner: { name: string; avatar?: string };
  parentPath?: string;
  children?: FileItem[];
  previewUrl?: string | null;
};

const initialFileItems: FileItem[] = JSON.parse(JSON.stringify(fileManagerData)) as FileItem[];

const ACCEPTED_TYPES = "Image, Video & PDF only";

function getChildrenAtPath(pathSegments: string[], items: FileItem[]): FileItem[] {
  if (pathSegments.length === 0) return items;
  let current: FileItem[] = items;
  for (const seg of pathSegments) {
    const next = current.find((i) => i.name === seg);
    if (!next?.children) return [];
    current = next.children;
  }
  return current;
}

function deleteItemsInTree(items: FileItem[], ids: Set<string>): FileItem[] {
  return items
    .filter((item) => !ids.has(item.id))
    .map((item) => ({
      ...item,
      children: item.children ? deleteItemsInTree(item.children, ids) : undefined,
    }));
}

function addFolderToPath(items: FileItem[], pathSegments: string[], folderName: string): FileItem[] {
  const newFolder: FileItem = {
    id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: folderName,
    type: "folder",
    icon: "folder",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, "."),
    size: "0 B",
    owner: { name: "User" },
    children: [],
  };
  if (pathSegments.length === 0) return [...items, newFolder];
  return items.map((item) => {
    if (item.name !== pathSegments[0]) return item;
    const rest = pathSegments.slice(1);
    return {
      ...item,
      children: rest.length === 0
        ? [...(item.children || []), newFolder]
        : addFolderToPath(item.children || [], rest, folderName),
    };
  });
}

/** Find items by id in tree (recursive). */
function findItemsById(items: FileItem[], ids: Set<string>): FileItem[] {
  const result: FileItem[] = [];
  for (const item of items) {
    if (ids.has(item.id)) result.push(JSON.parse(JSON.stringify(item)));
    if (item.children?.length) result.push(...findItemsById(item.children, ids));
  }
  return result;
}

/** Add an existing item back into the tree at path. */
function addItemToPath(items: FileItem[], pathSegments: string[], entry: FileItem): FileItem[] {
  if (pathSegments.length === 0) return [...items, entry];
  return items.map((item) => {
    if (item.name !== pathSegments[0]) return item;
    const rest = pathSegments.slice(1);
    return {
      ...item,
      children: rest.length === 0
        ? [...(item.children || []), entry]
        : addItemToPath(item.children || [], rest, entry),
    };
  });
}

function getFileIcon(iconType: string, className?: string) {
  const base = "h-5 w-5 shrink-0";
  switch (iconType) {
    case "folder":
      return <Folder className={cn(base, "text-amber-500", className)} />;
    case "image":
      return <FileImage className={cn(base, "text-emerald-600 dark:text-emerald-400", className)} />;
    case "video":
      return <FileVideo className={cn(base, "text-blue-600 dark:text-blue-400", className)} />;
    case "pdf":
      return <FileText className={cn(base, "text-red-600 dark:text-red-400", className)} />;
    default:
      return <FileText className={cn(base, "text-muted-foreground", className)} />;
  }
}

function getFileTypeBadge(fileType: FileTypeKind | null | undefined) {
  if (!fileType) return null;
  const styles = {
    image: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    video: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    pdf: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  };
  return (
    <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", styles[fileType])}>
      {fileType}
    </span>
  );
}

type SortOption = "name" | "date" | "size";
type SortDirection = "asc" | "desc";

/** Flatten entire tree: every file and folder with its parent path (path to the folder that contains it). */
function getAllItemsWithPath(
  items: FileItem[],
  parentPath: string[]
): { item: FileItem; path: string[] }[] {
  const result: { item: FileItem; path: string[] }[] = [];
  for (const item of items) {
    result.push({ item, path: parentPath });
    if (item.children?.length) {
      result.push(...getAllItemsWithPath(item.children, [...parentPath, item.name]));
    }
  }
  return result;
}

export function FileManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<FileItem[]>(() => initialFileItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [trash, setTrash] = useState<TrashedEntry[]>([]);
  const [trashOpen, setTrashOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string> | null>(null);
  const [pendingDeletePath, setPendingDeletePath] = useState<string[]>([]);
  const [folderSearchQuery, setFolderSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FileTypeKind | "all">("all");

  const currentPath = searchParams.get("path") || "";
  const pathSegments = currentPath ? currentPath.split("/").filter(Boolean) : [];
  const isMobile = useIsMobile();

  const parseFileSize = (sizeStr: string): number => {
    const size = Number.parseFloat(sizeStr);
    if (sizeStr.includes("GB")) return size * 1024 * 1024 * 1024;
    if (sizeStr.includes("MB")) return size * 1024 * 1024;
    if (sizeStr.includes("KB")) return size * 1024;
    return size;
  };

  const parseDate = (dateStr: string): number => {
    const [day, month, year] = dateStr.split(".");
    return new Date(2000 + parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)).getTime();
  };

  const sortItems = (items: FileItem[]): FileItem[] => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison = parseDate(a.date) - parseDate(b.date);
          break;
        case "size":
          comparison = parseFileSize(a.size) - parseFileSize(b.size);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const searchTrimmed = searchQuery.trim().toLowerCase();
  const isGlobalSearch = searchTrimmed.length > 0;
  const folderSearchTrimmed = folderSearchQuery.trim().toLowerCase();

  const currentItems = getChildrenAtPath(pathSegments, items);
  const globalResultsRaw = isGlobalSearch
    ? getAllItemsWithPath(items, []).filter(({ item }) =>
        item.name.toLowerCase().includes(searchTrimmed)
      )
    : [];

  const filteredByTypeGlobal =
    typeFilter === "all"
      ? globalResultsRaw
      : globalResultsRaw.filter(
          ({ item }) => item.type === "folder" || item.fileType === typeFilter
        );

  /** When not in global search, filter current folder by folder-search input. */
  const filteredByFolderSearch = currentItems.filter((item) =>
    folderSearchTrimmed.length === 0 || item.name.toLowerCase().includes(folderSearchTrimmed)
  );
  const filteredByTypeCurrent =
    typeFilter === "all"
      ? filteredByFolderSearch
      : filteredByFolderSearch.filter((item) => item.type === "folder" || item.fileType === typeFilter);

  const sortedGlobalResults = [...filteredByTypeGlobal].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.item.name.localeCompare(b.item.name);
        break;
      case "date":
        comparison = parseDate(a.item.date) - parseDate(b.item.date);
        break;
      case "size":
        comparison = parseFileSize(a.item.size) - parseFileSize(b.item.size);
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const sortedAndFilteredItems = isGlobalSearch
    ? sortedGlobalResults.map(({ item }) => item)
    : sortItems(filteredByTypeCurrent);

  const displayPaths = isGlobalSearch
    ? new Map(sortedGlobalResults.map((r) => [r.item.id, r.path]))
    : null;

  /** Only files in current folder (when not in global search) are selectable. */
  const currentFolderFiles = !isGlobalSearch
    ? sortedAndFilteredItems.filter((i) => i.type === "file")
    : [];
  const currentFolderFileIds = new Set(currentFolderFiles.map((i) => i.id));
  const selectedFileCount = [...selectedItems].filter((id) => currentFolderFileIds.has(id)).length;

  useEffect(() => {
    setSelectedItem(null);
    setShowMobileDetails(false);
  }, [currentPath]);

  useEffect(() => {
    if (isGlobalSearch) setSelectedItems(new Set());
  }, [isGlobalSearch]);

  useEffect(() => {
    setSelectedItems(new Set());
  }, [currentPath]);

  useEffect(() => {
    if (isGlobalSearch) setFolderSearchQuery("");
  }, [isGlobalSearch]);

  useEffect(() => {
    setFolderSearchQuery("");
  }, [currentPath]);

  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  const getSortLabel = () => {
    const dir = sortDirection === "asc" ? "↑" : "↓";
    switch (sortBy) {
      case "name": return `Name ${dir}`;
      case "date": return `Date ${dir}`;
      case "size": return `Size ${dir}`;
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (isGlobalSearch && displayPaths) {
      const path = displayPaths.get(item.id) ?? [];
      if (item.type === "folder") {
        const folderPath = [...path, item.name].join("/");
        router.push(folderPath ? `?path=${encodeURIComponent(folderPath)}` : "/file-manager");
        setSearchQuery("");
      } else {
        const parentPath = path.join("/");
        router.push(parentPath ? `?path=${encodeURIComponent(parentPath)}` : "/file-manager");
        setSelectedItem(item);
        setShowMobileDetails(true);
        setSearchQuery("");
      }
      return;
    }
    if (item.type === "folder") {
      const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      router.push(`?path=${encodeURIComponent(newPath)}`);
    } else {
      setSelectedItem(item);
      setShowMobileDetails(true);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      router.push("/file-manager");
    } else {
      const newPath = pathSegments.slice(0, index + 1).join("/");
      router.push(newPath ? `?path=${encodeURIComponent(newPath)}` : "/file-manager");
    }
  };

  const toggleSelectAll = () => {
    if (!currentFolderFiles.length) return;
    const allSelected = currentFolderFiles.every((f) => selectedItems.has(f.id));
    if (allSelected) {
      setSelectedItems((prev) => {
        const next = new Set(prev);
        currentFolderFiles.forEach((f) => next.delete(f.id));
        return next;
      });
    } else {
      setSelectedItems((prev) => {
        const next = new Set(prev);
        currentFolderFiles.forEach((f) => next.add(f.id));
        return next;
      });
    }
  };

  const toggleItemSelection = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGlobalSearch || !currentFolderFileIds.has(itemId)) return;
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const goToParent = () => {
    if (pathSegments.length <= 0) return;
    const parentPath = pathSegments.slice(0, -1).join("/");
    router.push(parentPath ? `?path=${encodeURIComponent(parentPath)}` : "/file-manager");
  };

  const moveToTrash = (ids: Set<string>, originalPath: string[]) => {
    const toTrash = findItemsById(items, ids);
    if (toTrash.length === 0) return;
    setItems((prev) => deleteItemsInTree(prev, ids));
    setTrash((prev) => [...prev, ...toTrash.map((item) => ({ item, originalPath }))]);
    setSelectedItems((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    if (selectedItem && ids.has(selectedItem.id)) setSelectedItem(null);
    toast.success(toTrash.length === 1 ? "Moved to trash" : `${toTrash.length} item(s) moved to trash`);
  };

  const handleDeleteSelected = () => {
    const ids = new Set([...selectedItems].filter((id) => currentFolderFileIds.has(id)));
    if (ids.size === 0) return;
    setPendingDeleteIds(ids);
    setPendingDeletePath(pathSegments);
    setDeleteConfirmOpen(true);
  };

  const handleMoveSelected = () => {
    toast.info("Select destination folder (coming soon)");
  };

  const handleCopySelected = () => {
    toast.info("Select destination folder (coming soon)");
  };

  const handleDeleteOne = (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingDeleteIds(new Set([item.id]));
    setPendingDeletePath(pathSegments);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteIds || pendingDeleteIds.size === 0) return;
    moveToTrash(pendingDeleteIds, pendingDeletePath);
    if (selectedItem && pendingDeleteIds.has(selectedItem.id)) setSelectedItem(null);
    setPendingDeleteIds(null);
    setPendingDeletePath([]);
    setDeleteConfirmOpen(false);
  };

  const cancelDelete = () => {
    setPendingDeleteIds(null);
    setPendingDeletePath([]);
    setDeleteConfirmOpen(false);
  };

  const handleRestore = (entry: TrashedEntry) => {
    setTrash((prev) => prev.filter((e) => e.item.id !== entry.item.id));
    setItems((prev) => addItemToPath(prev, entry.originalPath, entry.item as FileItem));
    setTrashOpen(false);
    toast.success("Restored");
  };

  const handleRestoreMany = (entries: TrashedEntry[]) => {
    const ids = new Set(entries.map((e) => e.item.id));
    setTrash((prev) => prev.filter((e) => !ids.has(e.item.id)));
    setItems((prev) =>
      entries.reduce(
        (acc, entry) => addItemToPath(acc, entry.originalPath, entry.item as FileItem),
        prev
      )
    );
    setTrashOpen(false);
    toast.success(entries.length === 1 ? "Restored" : `${entries.length} item(s) restored`);
  };

  const handlePermanentDelete = (entry: TrashedEntry) => {
    setTrash((prev) => prev.filter((e) => e.item.id !== entry.item.id));
    toast.success("Permanently deleted");
  };

  const handlePermanentDeleteMany = (entries: TrashedEntry[]) => {
    const ids = new Set(entries.map((e) => e.item.id));
    setTrash((prev) => prev.filter((e) => !ids.has(e.item.id)));
    toast.success(entries.length === 1 ? "Permanently deleted" : `${entries.length} item(s) permanently deleted`);
  };

  const handleCreateFolder = (name: string) => {
    setItems((prev) => addFolderToPath(prev, pathSegments, name));
    toast.success(`Folder "${name}" created`);
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === "file") {
      setPreviewItem(item);
      setPreviewOpen(true);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header: breadcrumb + global search */}
      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb>
          <BreadcrumbList className="min-w-0 flex-1">
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/file-manager"
                onClick={(e) => {
                  e.preventDefault();
                  handleBreadcrumbClick(-1);
                }}
                className="flex items-center gap-1"
              >
                <Home className="h-4 w-4 shrink-0" />
                <span className="truncate">File Manager</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 0 && (
              <>
                <BreadcrumbSeparator />
                {pathSegments.map((segment, i) => (
                  <React.Fragment key={`${i}-${segment}`}>
                    <BreadcrumbItem>
                      <button
                        type="button"
                        onClick={() => handleBreadcrumbClick(i)}
                        className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-[180px]"
                      >
                        {segment}
                      </button>
                    </BreadcrumbItem>
                    {i < pathSegments.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="relative w-full sm:w-72 sm:shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search all files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 pr-9 bg-muted/50 border-border focus-visible:ring-primary/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        {!isGlobalSearch && (
          <div className="relative flex-1 min-w-[140px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search in this folder..."
              value={folderSearchQuery}
              onChange={(e) => setFolderSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-9"
            />
            {folderSearchQuery && (
              <button
                type="button"
                onClick={() => setFolderSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear folder search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          {(["all", "image", "video", "pdf"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                typeFilter === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t === "all" ? "All" : t === "image" ? "Images" : t === "video" ? "Videos" : "PDFs"}
            </button>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {getSortLabel()}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleSortChange("name")}>Name</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("date")}>Date</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("size")}>Size</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setNewFolderOpen(true)}>
          <FolderPlus className="h-4 w-4" />
          New folder
        </Button>
        <Button size="sm" className="gap-1" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" />
          Upload
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setTrashOpen(true)}
          title="Trash"
        >
          <Trash2 className="h-4 w-4" />
          Trash
          {trash.length > 0 && (
            <span className="rounded-full bg-destructive/90 px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground min-w-[18px] text-center">
              {trash.length > 99 ? "99+" : trash.length}
            </span>
          )}
        </Button>
        <FileUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
        <CreateFolderDialog
          open={newFolderOpen}
          onOpenChange={setNewFolderOpen}
          currentPath={currentPath}
          onCreate={handleCreateFolder}
        />
      </div>

      {/* Selection action bar: only when not in global search and only current-folder files selected */}
      {!isGlobalSearch && selectedFileCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">
            {selectedFileCount} file{selectedFileCount !== 1 ? "s" : ""} selected
          </span>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleMoveSelected}>
            <Share2 className="h-4 w-4" />
            Move
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleCopySelected}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={handleDeleteSelected}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      {/* File list */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-auto p-4">
          {viewMode === "list" ? (
            <div className="rounded-lg border">
              {(sortedAndFilteredItems.length > 0 || (pathSegments.length > 0 && !isGlobalSearch)) && (
                <div className="flex items-center gap-2 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
                  <div className="w-8 shrink-0">
                    {!isGlobalSearch && currentFolderFiles.length > 0 && (
                      <Checkbox
                        checked={currentFolderFiles.length > 0 && currentFolderFiles.every((f) => selectedItems.has(f.id))}
                        onCheckedChange={() => toggleSelectAll()}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">Name</div>
                  {isGlobalSearch && <div className="w-32 shrink-0">Location</div>}
                  <div className="w-20 shrink-0">Date</div>
                  <div className="w-24 shrink-0">Size</div>
                  <div className="w-8 shrink-0" />
                </div>
              )}
              {pathSegments.length > 0 && !isGlobalSearch && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={goToParent}
                  onKeyDown={(e) => e.key === "Enter" && goToParent()}
                  className="flex items-center gap-2 px-4 py-2.5 border-b cursor-pointer transition-colors hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                >
                  <div className="w-8 shrink-0" />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center font-mono text-lg leading-none">
                    ..
                  </div>
                 
                  {isGlobalSearch && <div className="w-32 shrink-0" />}
                  <div className="w-20 shrink-0" />
                  <div className="w-24 shrink-0" />
                  <div className="w-8 shrink-0" />
                </div>
              )}
              {sortedAndFilteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-muted/50",
                    selectedItem?.id === item.id && "bg-muted/80"
                  )}
                >
                  <div className="w-8 shrink-0 flex items-center" onClick={(e) => item.type === "file" && !isGlobalSearch && toggleItemSelection(item.id, e)}>
                    {item.type === "file" && !isGlobalSearch ? (
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => {
                          if (isGlobalSearch || !currentFolderFileIds.has(item.id)) return;
                          setSelectedItems((prev) => {
                            const next = new Set(prev);
                            if (next.has(item.id)) next.delete(item.id);
                            else next.add(item.id);
                            return next;
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="inline-block w-4 h-4" />
                    )}
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {getFileIcon(item.icon)}
                  </div>
                  <div className="flex flex-1 min-w-0 items-center gap-2">
                    <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                    {item.type === "file" && getFileTypeBadge(item.fileType)}
                  </div>
                  {isGlobalSearch && displayPaths && (
                    <div className="w-32 shrink-0 truncate text-xs text-muted-foreground" title={(displayPaths.get(item.id) ?? []).join(" / ") || "Root"}>
                      {(displayPaths.get(item.id) ?? []).join(" / ") || "—"}
                    </div>
                  )}
                  <div className="w-20 shrink-0 text-muted-foreground text-sm">{item.date}</div>
                  <div className="w-24 shrink-0 text-muted-foreground text-sm">{item.size}</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveSelected(); }}><Share2 className="h-4 w-4 mr-2" /> Move</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopySelected(); }}><Copy className="h-4 w-4 mr-2" /> Copy</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={(e) => handleDeleteOne(item, e)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {pathSegments.length > 0 && !isGlobalSearch && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={goToParent}
                  onKeyDown={(e) => e.key === "Enter" && goToParent()}
                  className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/30 text-muted-foreground"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center font-mono text-2xl">
                    ..
                  </div>
                  
                </div>
              )}
              {sortedAndFilteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/30",
                    selectedItem?.id === item.id && "bg-muted border-primary/50"
                  )}
                >
                  {item.type === "file" && !isGlobalSearch && (
                    <div
                      className="absolute top-2 left-2 z-10"
                      onClick={(e) => { e.stopPropagation(); toggleItemSelection(item.id, e); }}
                    >
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => {
                          if (isGlobalSearch || !currentFolderFileIds.has(item.id)) return;
                          setSelectedItems((prev) => {
                            const next = new Set(prev);
                            if (next.has(item.id)) next.delete(item.id);
                            else next.add(item.id);
                            return next;
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                    {getFileIcon(item.icon, "h-10 w-10")}
                  </div>
                  <span className="text-sm font-medium truncate w-full text-center">{item.name}</span>
                  {isGlobalSearch && displayPaths && (
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center" title={(displayPaths.get(item.id) ?? []).join(" / ") || "Root"}>
                      {(displayPaths.get(item.id) ?? []).join(" / ") || "—"}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 justify-center flex-wrap">
                    {item.type === "file" && getFileTypeBadge(item.fileType)}
                    <span className="text-xs text-muted-foreground">{item.size}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sortedAndFilteredItems.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <FileImage className="h-12 w-12 mb-4 opacity-50" />
              <p>No images, videos or PDFs matching &quot;{searchQuery}&quot;</p>
            </div>
          )}

          {sortedAndFilteredItems.length === 0 && !searchQuery && folderSearchTrimmed && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Search className="h-12 w-12 mb-4 opacity-50" />
              <p>No items in this folder match &quot;{folderSearchQuery.trim()}&quot;</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setFolderSearchQuery("")}>
                Clear search
              </Button>
            </div>
          )}

          {sortedAndFilteredItems.length === 0 && !searchQuery && !folderSearchTrimmed && pathSegments.length > 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Folder className="h-12 w-12 mb-4 opacity-50" />
              <p>This folder is empty. Upload images, videos or PDFs.</p>
              <Button className="mt-4 gap-1" onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          )}

          {sortedAndFilteredItems.length === 0 && !searchQuery && !folderSearchTrimmed && pathSegments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Folder className="h-12 w-12 mb-4 opacity-50" />
              <p>No files yet. Upload images, videos or PDFs to get started.</p>
            </div>
          )}
        </div>

        {/* Desktop: right details panel */}
        {selectedItem && !isMobile && (
          <div className="w-80 shrink-0 border-l bg-muted/30 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-semibold truncate">Details</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedItem(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-6 overflow-auto">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background border">
                  {getFileIcon(selectedItem.icon, "h-8 w-8")}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-medium truncate block">{selectedItem.name}</span>
                  {selectedItem.fileType && getFileTypeBadge(selectedItem.fileType)}
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <p className="font-medium text-muted-foreground">Info</p>
                <dl className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium">{selectedItem.fileType ? selectedItem.fileType.charAt(0).toUpperCase() + selectedItem.fileType.slice(1) : selectedItem.type}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Size</dt>
                    <dd className="font-medium">{selectedItem.size}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Owner</dt>
                    <dd className="font-medium">{selectedItem.owner.name}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-medium truncate">{currentPath ? `My Files/${currentPath}` : "My Files"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Modified</dt>
                    <dd className="font-medium">Sep 17, 2020</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">Sep 10, 2020</dd>
                  </div>
                </dl>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-muted-foreground">Settings</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>File Sharing</li>
                  <li>Backup</li>
                  <li>Sync</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: sheet for file details */}
      <Sheet open={selectedItem != null && isMobile} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>File Details</SheetTitle>
          </SheetHeader>
          {selectedItem && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {getFileIcon(selectedItem.icon, "h-8 w-8")}
                </div>
                <span className="font-medium">{selectedItem.name}</span>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{selectedItem.fileType ? selectedItem.fileType.charAt(0).toUpperCase() + selectedItem.fileType.slice(1) : selectedItem.type}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Size</dt>
                  <dd>{selectedItem.size}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Owner</dt>
                  <dd>{selectedItem.owner.name}</dd>
                </div>
              </dl>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move to trash?</DialogTitle>
            <DialogDescription>
              {pendingDeleteIds?.size === 1
                ? (() => {
                    const toTrash = findItemsById(items, pendingDeleteIds);
                    const name = toTrash[0]?.name ?? "this item";
                    return `"${name}" will be moved to trash. You can restore it from Trash later.`;
                  })()
                : `${pendingDeleteIds?.size ?? 0} item(s) will be moved to trash. You can restore them from Trash later.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Move to trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FilePreviewDialog
        item={previewItem}
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setPreviewItem(null);
        }}
      />
      <TrashBinDialog
        open={trashOpen}
        onOpenChange={setTrashOpen}
        trash={trash}
        onRestore={handleRestore}
        onRestoreMany={handleRestoreMany}
        onPermanentDelete={handlePermanentDelete}
        onPermanentDeleteMany={handlePermanentDeleteMany}
      />
    </div>
  );
}
