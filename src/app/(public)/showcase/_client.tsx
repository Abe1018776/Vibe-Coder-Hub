"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { ChevronUp, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ShowcaseProject } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(5, "At least 5 chars"),
  builderName: z.string().min(1, "Required"),
  url: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  tools: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function csvSplit(v: string | undefined): string[] {
  return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

export default function ShowcaseClient({
  initialProjects,
}: {
  initialProjects: ShowcaseProject[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [upvoting, setUpvoting] = useState<number | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      builderName: "",
      url: "",
      tags: "",
      tools: "",
    },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/showcase", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          builderName: data.builderName,
          url: data.url || null,
          tags: csvSplit(data.tags),
          tools: csvSplit(data.tools),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Project submitted");
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error("Submit failed");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function upvote(id: number) {
    setUpvoting(id);
    try {
      const res = await fetch(`/api/showcase/${id}/upvote`, { method: "POST" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Upvote failed");
    } finally {
      setUpvoting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Product Showcase</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vibe Coded projects by the community
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={14} /> Submit project
        </Button>
      </div>

      {initialProjects.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No projects yet. Be the first to showcase something.
        </div>
      ) : (
        <div className="grid gap-4">
          {initialProjects.map((p) => (
            <div key={p.id} className="border border-border rounded-md bg-card p-4 flex gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
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
                <div className="text-xs text-muted-foreground mt-0.5">by {p.builderName}</div>
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-3">
                  {p.description}
                </p>
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
              </div>
              <button
                onClick={() => upvote(p.id)}
                disabled={upvoting === p.id}
                className="flex flex-col items-center gap-0.5 border border-border rounded-md px-2.5 py-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors shrink-0 min-w-[44px]"
              >
                <ChevronUp size={14} />
                <span className="text-xs font-bold">{p.upvotes}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit a project</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label>Project name</Label>
              <Input {...form.register("name")} placeholder="My Vibe App" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>
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
              <Label>URL (optional)</Label>
              <Input {...form.register("url")} placeholder="https://..." />
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
                {submitting ? "Submitting…" : "Submit"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
