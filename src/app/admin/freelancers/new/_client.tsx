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

const schema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  skills: z.string().optional(),
  tags: z.string().optional(),
  tools: z.string().optional(),
  hourlyRate: z.string().optional(),
  portfolioLinks: z.string().optional(),
  contactInfo: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const csv = (s?: string) =>
  s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];

export default function CreateFreelancerClient() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(d: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/freelancers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          bio: d.bio || null,
          skills: csv(d.skills),
          tags: csv(d.tags),
          tools: csv(d.tools),
          portfolioLinks: csv(d.portfolioLinks),
          hourlyRate: d.hourlyRate ? Number(d.hourlyRate) : null,
          contactInfo: d.contactInfo || null,
          notes: d.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Freelancer added");
      router.push("/freelancers");
      router.refresh();
    } catch {
      toast.error("Failed to add");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <Label>Name</Label>
        <Input {...form.register("name")} />
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea {...form.register("bio")} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Hourly rate ($)</Label>
          <Input {...form.register("hourlyRate")} type="number" />
        </div>
        <div>
          <Label>Contact info</Label>
          <Input {...form.register("contactInfo")} placeholder="email / handle" />
        </div>
      </div>
      <div>
        <Label>Skills (CSV)</Label>
        <Input {...form.register("skills")} placeholder="react, typescript" />
      </div>
      <div>
        <Label>Tags (CSV)</Label>
        <Input {...form.register("tags")} placeholder="frontend, vibe-coder" />
      </div>
      <div>
        <Label>Tools (CSV)</Label>
        <Input {...form.register("tools")} placeholder="cursor, claude" />
      </div>
      <div>
        <Label>Portfolio links (CSV)</Label>
        <Input {...form.register("portfolioLinks")} placeholder="https://..., https://..." />
      </div>
      <div>
        <Label>Internal notes</Label>
        <Textarea {...form.register("notes")} rows={2} />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save freelancer"}
      </Button>
    </form>
  );
}
