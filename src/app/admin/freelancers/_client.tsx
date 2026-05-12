"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Freelancer } from "@/lib/db";

export default function FreelancerListClient({ freelancers }: { freelancers: Freelancer[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (!confirm("Remove this freelancer?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/freelancers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Freelancer removed");
      router.refresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  if (freelancers.length === 0) {
    return (
      <div className="border border-border rounded-md bg-card p-10 text-center text-sm text-muted-foreground">
        No freelancers yet.{" "}
        <Link href="/admin/freelancers/new">
          <span className="text-primary underline cursor-pointer">Add the first one.</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md bg-card overflow-hidden">
      {freelancers.map((f) => (
        <div
          key={f.id}
          className="border-b border-border last:border-0 px-5 py-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{f.name}</div>
              {f.bio && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.bio}</div>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {f.tools.slice(0, 5).map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
                {f.skills.slice(0, 3).map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
              {f.hourlyRate && (
                <div className="text-xs text-muted-foreground mt-1.5">${f.hourlyRate}/hr</div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Link href={`/freelancers/${f.id}`}>
                <Button size="sm" variant="ghost">
                  <ExternalLink size={13} />
                </Button>
              </Link>
              <Link href={`/admin/freelancers/${f.id}`}>
                <Button size="sm" variant="outline">
                  <Pencil size={13} />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(f.id)}
                disabled={deleting === f.id}
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
