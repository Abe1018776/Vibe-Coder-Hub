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
  title: z.string().min(3, "Min 3 chars"),
  description: z.string().min(10, "Min 10 chars"),
  prizeAmount: z.string().min(1, "Required"),
  deadline: z.string().min(1, "Required"),
  loomUrl: z.string().optional(),
  referenceUrls: z.string().optional(),
  tags: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function lines(v: string | undefined) {
  return v
    ? v
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}
function csv(v: string | undefined) {
  return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

export default function NewCompetitionClient() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      prizeAmount: "",
      deadline: "",
      loomUrl: "",
      referenceUrls: "",
      tags: "",
    },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/competitions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          prizeAmount: Number(data.prizeAmount),
          deadline: data.deadline,
          loomUrl: data.loomUrl || null,
          referenceUrls: lines(data.referenceUrls),
          tags: csv(data.tags),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      toast.success("Competition posted");
      router.push(`/admin/competitions/${created.id}`);
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to post competition");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          {...form.register("title")}
          placeholder="AI image recreation contest — Studio Ghibli style"
        />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <Label>Task description</Label>
        <Textarea
          {...form.register("description")}
          rows={5}
          placeholder="Recreate the reference images in the given style. Submissions must be 1024x1024 PNG..."
        />
        {form.formState.errors.description && (
          <p className="text-xs text-destructive mt-1">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Prize amount ($)</Label>
          <Input
            {...form.register("prizeAmount")}
            type="number"
            min="0"
            placeholder="500"
          />
          {form.formState.errors.prizeAmount && (
            <p className="text-xs text-destructive mt-1">
              {form.formState.errors.prizeAmount.message}
            </p>
          )}
        </div>
        <div>
          <Label>Deadline</Label>
          <Input {...form.register("deadline")} type="datetime-local" />
          {form.formState.errors.deadline && (
            <p className="text-xs text-destructive mt-1">
              {form.formState.errors.deadline.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label>Loom walkthrough (optional)</Label>
        <Input {...form.register("loomUrl")} placeholder="https://www.loom.com/share/abc123" />
        <p className="text-xs text-muted-foreground mt-1">
          Embeds a video on the public competition page
        </p>
      </div>

      <div>
        <Label>Reference URLs (one per line)</Label>
        <Textarea
          {...form.register("referenceUrls")}
          rows={3}
          placeholder={`https://imgur.com/abc.jpg\nhttps://drive.google.com/file/d/...`}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Reference images, style guides, or examples
        </p>
      </div>

      <div>
        <Label>Tags (CSV)</Label>
        <Input {...form.register("tags")} placeholder="ai, image, style-transfer" />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Posting…" : "Post competition"}
        </Button>
      </div>
    </form>
  );
}
