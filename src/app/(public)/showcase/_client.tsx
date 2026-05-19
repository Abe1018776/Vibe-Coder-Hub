"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronUp,
  ExternalLink,
  Plus,
  MessageSquare,
  Trash2,
  Play,
  Image as ImageIcon,
  Send,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import type { ShowcaseProject, ShowcaseComment } from "@/lib/db";
import { formatRelativeTime } from "@/lib/utils";

type ProjectWithComments = ShowcaseProject & { comments: ShowcaseComment[] };

const submitSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(5, "At least 5 chars"),
  builderName: z.string().min(1, "Required"),
  url: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  tools: z.string().optional(),
});
type SubmitData = z.infer<typeof submitSchema>;

const commentSchema = z.object({
  content: z.string().min(1).max(500),
});
type CommentData = z.infer<typeof commentSchema>;

function csvSplit(v: string | undefined): string[] {
  return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

function rankBadge(rank: number) {
  if (rank === 1) return "bg-amber-500 text-white";
  if (rank === 2) return "bg-gray-400 text-white";
  if (rank === 3) return "bg-orange-700 text-white";
  return "bg-muted text-muted-foreground";
}

export default function ShowcaseClient({
  initialProjects,
  title = "Product Showcase",
  subtitle = "Vibe-coded projects ranked by the community",
  emptyText = "No projects yet. Be the first to showcase something.",
  defaultTags = "",
}: {
  initialProjects: ProjectWithComments[];
  title?: string;
  subtitle?: string;
  emptyText?: string;
  defaultTags?: string;
}) {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [upvoting, setUpvoting] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [sendingComment, setSendingComment] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(Boolean(d?.isAdmin)))
      .catch(() => {});
  }, [isSignedIn]);

  const form = useForm<SubmitData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      name: "",
      description: "",
      builderName: "",
      url: "",
      imageUrl: "",
      videoUrl: "",
      tags: defaultTags,
      tools: "",
    },
  });

  async function onSubmit(data: SubmitData) {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        builderName: data.builderName,
        url: data.url || null,
        imageUrl: data.imageUrl || null,
        videoUrl: data.videoUrl || null,
        tags: csvSplit(data.tags),
        tools: csvSplit(data.tools),
      };
      const url = editingId
        ? `/api/showcase/${editingId}`
        : "/api/showcase";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(editingId ? "Project updated" : "Project submitted");
      form.reset();
      setEditingId(null);
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(editingId ? "Update failed" : "Submit failed");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(p: ProjectWithComments) {
    setEditingId(p.id);
    form.reset({
      name: p.name,
      description: p.description,
      builderName: p.builderName,
      url: p.url ?? "",
      imageUrl: p.imageUrl ?? "",
      videoUrl: p.videoUrl ?? "",
      tags: p.tags.join(", "),
      tools: p.tools.join(", "),
    });
    setOpen(true);
  }

  function openNew() {
    setEditingId(null);
    form.reset({
      name: "",
      description: "",
      builderName: "",
      url: "",
      imageUrl: "",
      videoUrl: "",
      tags: defaultTags,
      tools: "",
    });
    setOpen(true);
  }

  async function upvote(id: number) {
    if (!isSignedIn) {
      toast.error("Sign in to upvote");
      return;
    }
    setUpvoting(id);
    try {
      const res = await fetch(`/api/showcase/${id}/upvote`, { method: "POST" });
      if (res.status === 409) {
        toast.error("Already upvoted");
        return;
      }
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Upvote failed");
    } finally {
      setUpvoting(null);
    }
  }

  async function addComment(projectId: number) {
    const content = commentDrafts[projectId]?.trim();
    if (!content || !isSignedIn) return;
    setSendingComment(projectId);
    try {
      const res = await fetch(`/api/showcase/${projectId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, userName: "User" }),
      });
      if (!res.ok) throw new Error();
      setCommentDrafts((prev) => ({ ...prev, [projectId]: "" }));
      router.refresh();
    } catch {
      toast.error("Comment failed");
    } finally {
      setSendingComment(null);
    }
  }

  async function deleteProject(id: number) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/showcase/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Project removed");
      router.refresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  function toggleComments(id: number) {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        </div>
        {isSignedIn && (
          <Button size="sm" onClick={openNew}>
            <Plus size={14} /> Submit project
          </Button>
        )}
      </div>

      {initialProjects.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {initialProjects.map((p, idx) => {
            const rank = idx + 1;
            const showComments = expandedComments.has(p.id);
            const commentCount = p.comments.length;

            return (
              <div
                key={p.id}
                className="border border-border rounded-md bg-card overflow-hidden"
              >
                <div className="p-4 flex gap-4">
                  {/* Rank + Upvote */}
                  <div className="flex flex-col items-center gap-1 shrink-0 min-w-[52px]">
                    <button
                      onClick={() => upvote(p.id)}
                      disabled={upvoting === p.id}
                      className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-md border transition-colors cursor-pointer ${
                        false
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      <ChevronUp size={16} />
                      <span className="text-sm font-bold">{p.upvotes}</span>
                    </button>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${rankBadge(
                        rank,
                      )}`}
                    >
                      #{rank}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{p.name}</span>
                          {p.url && (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          by {p.builderName}
                        </div>
                      </div>
                      {(p.createdBy === userId || isAdmin) && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer p-1"
                            title={
                              p.createdBy === userId
                                ? "Edit project"
                                : "Edit (admin override)"
                            }
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Remove this project?")) deleteProject(p.id);
                            }}
                            disabled={deleting === p.id}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer p-1"
                            title={
                              p.createdBy === userId
                                ? "Remove project"
                                : "Remove (admin override)"
                            }
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Preview area */}
                    {p.videoUrl && (
                      <div className="mt-3 rounded-md overflow-hidden border border-border bg-muted/30">
                        <video
                          src={p.videoUrl}
                          controls
                          preload="metadata"
                          className="w-full max-h-[200px] object-cover"
                          poster={p.imageUrl || undefined}
                        />
                      </div>
                    )}
                    {!p.videoUrl && p.imageUrl && (
                      <div className="mt-3 rounded-md overflow-hidden border border-border bg-muted/30">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full max-h-[200px] object-cover"
                        />
                      </div>
                    )}
                    {p.videoUrl && !p.imageUrl && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                        <Play size={12} /> Video preview available
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {p.description}
                    </p>

                    {/* Tags & tools */}
                    {p.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.tools.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.tags.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comment toggle */}
                    <button
                      onClick={() => toggleComments(p.id)}
                      className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <MessageSquare size={12} />
                      {commentCount} comment{commentCount !== 1 ? "s" : ""}
                    </button>

                    {/* Comments section */}
                    {showComments && (
                      <div className="mt-3 border-t border-border pt-3 space-y-2">
                        {commentCount > 0 ? (
                          p.comments.map((c) => (
                            <div
                              key={c.id}
                              className="text-sm bg-muted/30 rounded-md px-3 py-2"
                            >
                              <div className="text-xs font-medium text-foreground">
                                {c.userName}{" "}
                                <span className="text-muted-foreground font-normal">
                                  {formatRelativeTime(c.createdAt)}
                                </span>
                              </div>
                              <div className="text-muted-foreground mt-0.5">
                                {c.content}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-muted-foreground py-1">
                            No comments yet.
                          </div>
                        )}

                        {isSignedIn && (
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Add a comment..."
                              value={commentDrafts[p.id] || ""}
                              onChange={(e) =>
                                setCommentDrafts((prev) => ({
                                  ...prev,
                                  [p.id]: e.target.value,
                                }))
                              }
                              className="text-xs h-8"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  addComment(p.id);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 shrink-0"
                              onClick={() => addComment(p.id)}
                              disabled={
                                sendingComment === p.id ||
                                !commentDrafts[p.id]?.trim()
                              }
                            >
                              <Send size={12} />
                            </Button>
                          </div>
                        )}
                        {!isSignedIn && (
                          <a
                            href="/sign-in"
                            className="text-xs text-primary underline"
                          >
                            Sign in to comment
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit dialog */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditingId(null);
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit project" : "Submit a project"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label>Project name</Label>
              <Input {...form.register("name")} placeholder="My Vibe App" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label>Your name</Label>
              <Input {...form.register("builderName")} placeholder="Alex Vibe" />
              {form.formState.errors.builderName && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.builderName.message}
                </p>
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                {...form.register("description")}
                rows={3}
                placeholder="What does it do? How was it built?"
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div>
              <Label>Live URL (optional)</Label>
              <Input {...form.register("url")} placeholder="https://..." />
            </div>
            <div>
              <Label>Image preview URL (optional)</Label>
              <Input
                {...form.register("imageUrl")}
                placeholder="https://...screenshot.png"
              />
            </div>
            <div>
              <Label>Video preview URL (optional)</Label>
              <Input
                {...form.register("videoUrl")}
                placeholder="https://...demo.mp4"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Tools (CSV)</Label>
                <Input {...form.register("tools")} placeholder="Cursor, Replit" />
              </div>
              <div>
                <Label className="text-xs">Tags (CSV)</Label>
                <Input {...form.register("tags")} placeholder="ai, web-app" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? editingId
                    ? "Saving…"
                    : "Submitting…"
                  : editingId
                    ? "Save changes"
                    : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
