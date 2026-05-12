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
import { toast } from "sonner";
import type { Professional } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  company: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  expertise: z.string().optional(),
  tags: z.string().optional(),
  linkedIn: z.string().url("Invalid URL").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function csv(v: string | undefined) {
  return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

export default function ProfessionalForm({
  initial,
}: {
  initial?: Professional;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const editing = Boolean(initial);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      title: initial?.title ?? "",
      company: initial?.company ?? "",
      location: initial?.location ?? "",
      bio: initial?.bio ?? "",
      expertise: initial?.expertise?.join(", ") ?? "",
      tags: initial?.tags?.join(", ") ?? "",
      linkedIn: initial?.linkedIn ?? "",
      website: initial?.website ?? "",
      email: initial?.email ?? "",
      notes: initial?.notes ?? "",
    },
  });

  async function onSubmit(d: FormData) {
    setSubmitting(true);
    try {
      const payload = {
        name: d.name,
        title: d.title,
        company: d.company || null,
        location: d.location || null,
        bio: d.bio || null,
        expertise: csv(d.expertise),
        tags: csv(d.tags),
        linkedIn: d.linkedIn || null,
        website: d.website || null,
        email: d.email || null,
        notes: d.notes || null,
      };
      const url = editing
        ? `/api/professionals/${initial!.id}`
        : "/api/professionals";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(editing ? "Saved" : "Added to directory");
      router.push("/admin/directory");
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error(editing ? "Save failed" : "Add failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`Delete ${initial.name} from directory?`)) return;
    try {
      const res = await fetch(`/api/professionals/${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Removed");
      router.push("/admin/directory");
      router.refresh();
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Full name</Label>
          <Input {...form.register("name")} placeholder="Sarah Cohen" />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <Label>Title</Label>
          <Input {...form.register("title")} placeholder="ML Engineer" />
          {form.formState.errors.title && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Company (optional)</Label>
          <Input {...form.register("company")} placeholder="Acme AI" />
        </div>
        <div>
          <Label>Location (optional)</Label>
          <Input {...form.register("location")} placeholder="Brooklyn, NY" />
        </div>
      </div>

      <div>
        <Label>Bio (optional)</Label>
        <Textarea {...form.register("bio")} rows={3} placeholder="Short bio…" />
      </div>

      <div>
        <Label>Expertise (CSV)</Label>
        <Input {...form.register("expertise")} placeholder="LLM, vector DBs, fine-tuning" />
        <p className="text-xs text-muted-foreground mt-1">Shown as colored badges</p>
      </div>

      <div>
        <Label>Tags (CSV)</Label>
        <Input {...form.register("tags")} placeholder="founder, mentor, kosher-only" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>LinkedIn URL</Label>
          <Input {...form.register("linkedIn")} placeholder="https://linkedin.com/in/…" />
          {form.formState.errors.linkedIn && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.linkedIn.message}</p>
          )}
        </div>
        <div>
          <Label>Website</Label>
          <Input {...form.register("website")} placeholder="https://…" />
          {form.formState.errors.website && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.website.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label>Email (private — admin only)</Label>
        <Input {...form.register("email")} type="email" placeholder="contact@example.com" />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <Label>Internal notes (admin only)</Label>
        <Textarea {...form.register("notes")} rows={2} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? (editing ? "Saving…" : "Adding…") : editing ? "Save changes" : "Add to directory"}
        </Button>
        {editing && (
          <Button type="button" variant="outline" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
