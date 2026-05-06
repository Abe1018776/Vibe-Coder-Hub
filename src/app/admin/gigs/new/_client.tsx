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

const schema = z.object({
  title: z.string().min(3, "Min 3 chars"),
  description: z.string().min(10, "Min 10 chars"),
  type: z.enum(["task", "hourly", "build"]),
  requirements: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  hourlyRate: z.string().optional(),
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

export default function CreateGigClient() {
  const router = useRouter();
  const [type, setType] = useState<"task" | "hourly" | "build">("task");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      type: "task",
      requirements: "",
      budgetMin: "",
      budgetMax: "",
      hourlyRate: "",
      tags: "",
    },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/gigs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          type,
          requirements: data.requirements || null,
          budgetMin: num(data.budgetMin),
          budgetMax: num(data.budgetMax),
          hourlyRate: num(data.hourlyRate),
          tags: csv(data.tags),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      toast.success("Gig posted");
      router.push(`/admin/gigs/${created.id}`);
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to post gig");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input {...form.register("title")} placeholder="Build a Stripe checkout flow" />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          {...form.register("description")}
          rows={4}
          placeholder="What needs to be built?"
        />
        {form.formState.errors.description && (
          <p className="text-xs text-destructive mt-1">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div>
        <Label>Type</Label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as typeof type)}
        >
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
        <Textarea
          {...form.register("requirements")}
          rows={2}
          placeholder="Stack constraints, deadlines, etc."
        />
      </div>

      {type !== "hourly" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Budget min ($)</Label>
            <Input {...form.register("budgetMin")} type="number" placeholder="200" />
          </div>
          <div>
            <Label>Budget max ($)</Label>
            <Input {...form.register("budgetMax")} type="number" placeholder="500" />
          </div>
        </div>
      )}

      {type === "hourly" && (
        <div>
          <Label>Hourly rate ($)</Label>
          <Input {...form.register("hourlyRate")} type="number" placeholder="80" />
        </div>
      )}

      <div>
        <Label>Tags (CSV)</Label>
        <Input {...form.register("tags")} placeholder="stripe, nextjs" />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Posting…" : "Post gig"}
        </Button>
      </div>
    </form>
  );
}
