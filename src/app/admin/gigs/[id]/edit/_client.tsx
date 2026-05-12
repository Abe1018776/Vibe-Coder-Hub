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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Gig } from "@/lib/db";

const schema = z.object({
  title: z.string().min(3, "Min 3 chars"),
  description: z.string().min(10, "Min 10 chars"),
  requirements: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  hourlyRate: z.string().optional(),
  loomUrl: z.string().optional(),
  tags: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function csv(v: string | undefined) {
  return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
}
function num(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function EditGigClient({ gig }: { gig: Gig }) {
  const router = useRouter();
  const [type, setType] = useState(gig.type);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: gig.title,
      description: gig.description,
      requirements: gig.requirements ?? "",
      budgetMin: gig.budgetMin?.toString() ?? "",
      budgetMax: gig.budgetMax?.toString() ?? "",
      hourlyRate: gig.hourlyRate?.toString() ?? "",
      loomUrl: gig.loomUrl ?? "",
      tags: gig.tags.join(", "),
    },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/gigs/${gig.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          type,
          requirements: data.requirements || null,
          budgetMin: num(data.budgetMin),
          budgetMax: num(data.budgetMax),
          hourlyRate: num(data.hourlyRate),
          loomUrl: data.loomUrl || null,
          tags: csv(data.tags),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Gig updated");
      router.push(`/admin/gigs/${gig.id}`);
      router.refresh();
    } catch {
      toast.error("Failed to update gig");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input {...form.register("title")} />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea {...form.register("description")} rows={4} />
      </div>

      <div>
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="task">Task — fixed scope</SelectItem>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="build">Build — bigger project</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Requirements (optional)</Label>
        <Textarea {...form.register("requirements")} rows={2} />
      </div>

      {type !== "hourly" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Budget min ($)</Label>
            <Input {...form.register("budgetMin")} type="number" />
          </div>
          <div>
            <Label>Budget max ($)</Label>
            <Input {...form.register("budgetMax")} type="number" />
          </div>
        </div>
      )}

      {type === "hourly" && (
        <div>
          <Label>Hourly rate ($)</Label>
          <Input {...form.register("hourlyRate")} type="number" />
        </div>
      )}

      <div>
        <Label>Loom video (optional)</Label>
        <Input {...form.register("loomUrl")} placeholder="https://www.loom.com/share/abc123" />
        <p className="text-xs text-muted-foreground mt-1">Paste a Loom share link to embed a walkthrough</p>
      </div>

      <div>
        <Label>Tags (CSV)</Label>
        <Input {...form.register("tags")} placeholder="stripe, nextjs" />
      </div>

      <div className="flex gap-2 pt-2">
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
