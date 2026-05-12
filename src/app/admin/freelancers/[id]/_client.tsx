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
import { toast } from "sonner";
import type { Freelancer } from "@/lib/db";

interface Tag {
  id: number;
  name: string;
  category: "tool" | "skill" | "gig_type" | "general";
}

function TagPicker({
  label,
  tags,
  selected,
  onToggle,
}: {
  label: string;
  tags: Tag[];
  selected: string[];
  onToggle: (name: string) => void;
}) {
  if (tags.length === 0) return null;
  return (
    <div>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {tags.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onToggle(t.name)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
              selected.includes(t.name)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}

const schema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  hourlyRate: z.string().optional(),
  portfolioLinks: z.string().optional(),
  contactInfo: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function EditFreelancerClient({ freelancer }: { freelancer: Freelancer }) {
  const router = useRouter();
  const { userId } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>(freelancer.tools);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(freelancer.skills);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: freelancer.name,
      bio: freelancer.bio ?? "",
      hourlyRate: freelancer.hourlyRate?.toString() ?? "",
      portfolioLinks: freelancer.portfolioLinks.join(", "),
      contactInfo: freelancer.contactInfo ?? "",
      notes: freelancer.notes ?? "",
    },
  });

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setAllTags)
      .catch(() => {});
  }, []);

  const toolTags = allTags.filter((t) => t.category === "tool");
  const skillTags = allTags.filter((t) => t.category === "skill");

  function toggleTag(list: string[], name: string) {
    return list.includes(name) ? list.filter((x) => x !== name) : [...list, name];
  }

  async function onSubmit(d: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/freelancers/${freelancer.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          bio: d.bio || null,
          skills: selectedSkills,
          tools: selectedTools,
          portfolioLinks: d.portfolioLinks
            ? d.portfolioLinks.split(",").map((x) => x.trim()).filter(Boolean)
            : [],
          hourlyRate: d.hourlyRate ? Number(d.hourlyRate) : null,
          contactInfo: d.contactInfo || null,
          notes: d.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Freelancer updated");
      router.push(`/freelancers/${freelancer.id}`);
      router.refresh();
    } catch {
      toast.error("Failed to update");
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
      <TagPicker
        label="Vibe Coding Tools"
        tags={toolTags}
        selected={selectedTools}
        onToggle={(name) => setSelectedTools((prev) => toggleTag(prev, name))}
      />
      <TagPicker
        label="Skills"
        tags={skillTags}
        selected={selectedSkills}
        onToggle={(name) => setSelectedSkills((prev) => toggleTag(prev, name))}
      />
      <div>
        <Label>Portfolio links (CSV)</Label>
        <Input {...form.register("portfolioLinks")} placeholder="https://..., https://..." />
      </div>
      <div>
        <Label>Internal notes</Label>
        <Textarea {...form.register("notes")} rows={2} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
