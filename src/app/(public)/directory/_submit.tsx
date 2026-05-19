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
import { Plus } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  company: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  expertise: z.string().optional(),
  linkedIn: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  tags: z.string().optional(),
  // Honeypot — hidden field; bots will fill it.
  website_url_alt: z.string().max(0).optional(),
});
type FormData = z.infer<typeof schema>;

function csvSplit(v: string | undefined): string[] {
  return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

export default function DirectorySubmit() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      title: "",
      company: "",
      location: "",
      bio: "",
      expertise: "",
      linkedIn: "",
      website: "",
      email: "",
      tags: "",
    },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        title: data.title,
        company: data.company || null,
        location: data.location || null,
        bio: data.bio || null,
        expertise: csvSplit(data.expertise),
        linkedIn: data.linkedIn || null,
        website: data.website || null,
        email: data.email || null,
        tags: csvSplit(data.tags),
        website_url_alt: data.website_url_alt ?? "",
      };
      const res = await fetch("/api/professionals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Added to directory");
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

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} /> List yourself
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add to the directory</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Honeypot */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              {...form.register("website_url_alt")}
              style={{
                position: "absolute",
                left: "-10000px",
                width: 1,
                height: 1,
                opacity: 0,
              }}
            />
            <div>
              <Label>Full name</Label>
              <Input {...form.register("name")} placeholder="Yossi Goldstein" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label>Title / role</Label>
              <Input
                {...form.register("title")}
                placeholder="AI Engineer / Rabbi & Builder / …"
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Company (optional)</Label>
                <Input {...form.register("company")} />
              </div>
              <div>
                <Label className="text-xs">Location (optional)</Label>
                <Input {...form.register("location")} placeholder="Lakewood, NJ" />
              </div>
            </div>
            <div>
              <Label>Short bio (optional)</Label>
              <Textarea
                {...form.register("bio")}
                rows={3}
                placeholder="A sentence or two about what you build."
              />
            </div>
            <div>
              <Label className="text-xs">Expertise (CSV)</Label>
              <Input
                {...form.register("expertise")}
                placeholder="LLMs, RAG, Next.js"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">LinkedIn URL</Label>
                <Input {...form.register("linkedIn")} placeholder="https://..." />
              </div>
              <div>
                <Label className="text-xs">Website</Label>
                <Input {...form.register("website")} placeholder="https://..." />
              </div>
            </div>
            <div>
              <Label className="text-xs">Email (optional)</Label>
              <Input
                {...form.register("email")}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label className="text-xs">Tags (CSV)</Label>
              <Input
                {...form.register("tags")}
                placeholder="torah-tech, edtech, kashrus"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
