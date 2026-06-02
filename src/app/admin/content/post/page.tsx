import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdminUnlocked } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { AdminPostForm } from "@/components/admin/admin-post-form";
import type { PickableUser } from "@/components/admin/post-as-control";

export const metadata = { title: "Post content" };

export default async function AdminPostContentPage() {
  await requireAdminUnlocked();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name, handle")
    .order("name", { ascending: true })
    .limit(200);
  const users = (data ?? []) as PickableUser[];

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/content"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to content
      </Link>

      <h1 className="mt-3 font-display text-2xl text-ink">Post content</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Publish a gig, competition, or event — as Official YidVibe or on behalf
        of a user.
      </p>

      <div className="mt-6">
        <AdminPostForm users={users} />
      </div>
    </div>
  );
}
