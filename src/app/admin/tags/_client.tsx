"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tag } from "@/lib/db";

const CATEGORIES = ["tool", "skill", "gig_type", "general"] as const;

export default function TagsClient({ initialTags }: { initialTags: Tag[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("general");
  const [submitting, setSubmitting] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category }),
      });
      if (!res.ok) throw new Error();
      setName("");
      router.refresh();
      toast.success("Tag added");
    } catch {
      toast.error("Failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: number) {
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="border border-border rounded-md bg-card p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">Add tag</h2>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2 items-end">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="nextjs"
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as typeof category)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={create} disabled={submitting || !name.trim()}>
            Add
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-md bg-card overflow-hidden">
        {initialTags.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No tags yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {initialTags.map((t) => (
              <li
                key={t.id}
                className="px-4 py-2.5 flex items-center justify-between"
              >
                <div>
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className="text-xs text-muted-foreground ml-2 capitalize">
                    {t.category.replace("_", " ")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(t.id)}
                  className="text-destructive"
                >
                  <Trash2 size={13} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
