"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, ShieldOff, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE = "/api/blocked-ips";

type BlockedIp = {
  id: string;
  ip: string;
  reason: string;
  createdAt?: string;
};

export default function BlockedIpsPage() {
  const [list, setList] = React.useState<BlockedIp[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<BlockedIp | null>(null);
  const [addIp, setAddIp] = React.useState("");
  const [addReason, setAddReason] = React.useState("");
  const [addSaving, setAddSaving] = React.useState(false);
  const [deleteSaving, setDeleteSaving] = React.useState(false);

  const fetchList = React.useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load blocked IPs");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openAdd = () => {
    setAddIp("");
    setAddReason("");
    setIsAddOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const ip = addIp.trim();
    if (!ip) {
      toast.error("Enter an IP address");
      return;
    }
    setAddSaving(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, reason: addReason.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to add IP");
        return;
      }
      toast.success("IP blocked. Visits from this IP will not be counted.");
      setIsAddOpen(false);
      fetchList();
    } finally {
      setAddSaving(false);
    }
  };

  const openDelete = (item: BlockedIp) => {
    setToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleteSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${toDelete.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to remove IP");
        return;
      }
      toast.success("IP unblocked. Visits from this IP will be counted again.");
      setIsDeleteOpen(false);
      setToDelete(null);
      fetchList();
    } finally {
      setDeleteSaving(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-4">
        <SidebarTrigger className="-ml-1 rounded-lg" />
        <Separator orientation="vertical" className="mr-2 h-5" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/self-study">Self Study</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Visit Block List</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-6 overflow-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldOff className="h-5 w-5" />
                  Visit Block List
                </CardTitle>
                <CardDescription>
                  IPs in this list do not increase &quot;Total visit&quot; or &quot;Today&quot; on any level (exams, subjects, units, chapters, topics, sub-topics, definitions).
                </CardDescription>
              </div>
              <Button onClick={openAdd} className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Block IP
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : list.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">
                No blocked IPs. Click &quot;Block IP&quot; to add an IP whose visits should not be counted.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP address</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-muted-foreground">Added</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.ip}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.reason || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Unblock IP"
                          onClick={() => openDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Block IP</DialogTitle>
            <DialogDescription>
              Visits from this IP will not increase total visit or today counts on any level.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="block-ip">IP address</Label>
                <Input
                  id="block-ip"
                  placeholder="e.g. 192.168.1.1 or 2001:db8::1"
                  value={addIp}
                  onChange={(e) => setAddIp(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="block-reason">Reason (optional)</Label>
                <Input
                  id="block-reason"
                  placeholder="e.g. bot, internal testing"
                  value={addReason}
                  onChange={(e) => setAddReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={addSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addSaving}>
                {addSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding…
                  </>
                ) : (
                  "Block IP"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unblock IP</DialogTitle>
            <DialogDescription>
              Remove <span className="font-mono font-medium text-foreground">{toDelete?.ip}</span> from the block list? Visits from this IP will be counted again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteSaving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSaving}
            >
              {deleteSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing…
                </>
              ) : (
                "Unblock"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
