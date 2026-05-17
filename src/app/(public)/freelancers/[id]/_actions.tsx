"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Freelancer } from "@/lib/db";
import { useTranslations } from "next-intl";

export default function FreelancerActions({ freelancer }: { freelancer: Freelancer }) {
  const t = useTranslations("freelancers");
  const { userId } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const isCreator = freelancer.createdBy && freelancer.createdBy === userId;
  if (!isCreator) return null;

  async function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/freelancers/${freelancer.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(t("deleteSuccess"));
      router.push("/freelancers");
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link href={`/admin/freelancers/${freelancer.id}`}>
        <Button size="sm" variant="outline">
          <Pencil size={13} /> {t("edit")}
        </Button>
      </Link>
      <Button size="sm" variant="outline" onClick={handleDelete} disabled={deleting}>
        <Trash2 size={13} />
      </Button>
    </div>
  );
}
