"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Pencil, Trash2, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Professional } from "@/lib/db";

export default function DirectoryAdminClient({
  initial,
}: {
  initial: Professional[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete ${name} from directory?`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/professionals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Removed");
      router.refresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  if (initial.length === 0) {
    return (
      <div className="border border-border rounded-md bg-card p-10 text-center text-sm text-muted-foreground">
        No professionals yet.{" "}
        <Link href="/admin/directory/new">
          <span className="text-primary underline cursor-pointer">
            Add the first one.
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-2.5 font-medium">Name</th>
            <th className="text-left px-4 py-2.5 font-medium">Title</th>
            <th className="text-left px-4 py-2.5 font-medium">Company</th>
            <th className="text-left px-4 py-2.5 font-medium">Tags</th>
            <th className="text-right px-4 py-2.5 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initial.map((p) => (
            <tr key={p.id} className="border-t border-border hover:bg-muted/20">
              <td className="px-4 py-2.5">
                <div className="font-medium">{p.name}</div>
                {p.location && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin size={10} /> {p.location}
                  </div>
                )}
              </td>
              <td className="px-4 py-2.5 text-xs">{p.title}</td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {p.company || "—"}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {p.expertise.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                    >
                      {t}
                    </span>
                  ))}
                  {p.expertise.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{p.expertise.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center justify-end gap-1">
                  {p.linkedIn && (
                    <a
                      href={p.linkedIn}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-primary p-1"
                      title="LinkedIn"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <Link
                    href={`/admin/directory/${p.id}`}
                    className="text-muted-foreground hover:text-primary p-1"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={deleting === p.id}
                    className="text-muted-foreground hover:text-destructive p-1"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
