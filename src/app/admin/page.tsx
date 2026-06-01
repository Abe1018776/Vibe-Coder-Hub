import Link from "next/link";
import { Flag, Trophy, Calendar } from "lucide-react";
import { requireAdminUnlocked } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  await requireAdminUnlocked();
  const supabase = await createClient();
  const [{ count }, { count: pendingComps }, { count: pendingEvents }] =
    await Promise.all([
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("competitions")
        .select("id", { count: "exact", head: true })
        .eq("review_status", "pending"),
      supabase
        .from("event_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Moderation tools. (More admin capabilities coming in a later pass.)
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/reports"
          className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-border-hover"
        >
          <div className="flex items-center gap-2 text-ink">
            <Flag size={18} className="text-clay-mid" />
            <span className="font-medium">Reports</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {count ?? 0} open {count === 1 ? "report" : "reports"} to review.
          </p>
        </Link>

        <Link
          href="/admin/competitions"
          className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-border-hover"
        >
          <div className="flex items-center gap-2 text-ink">
            <Trophy size={18} className="text-gold-mid" />
            <span className="font-medium">Competition review</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {pendingComps ?? 0} pending{" "}
            {pendingComps === 1 ? "competition" : "competitions"}.
          </p>
        </Link>

        <Link
          href="/admin/events"
          className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-border-hover"
        >
          <div className="flex items-center gap-2 text-ink">
            <Calendar size={18} className="text-sage-mid" />
            <span className="font-medium">Event requests</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {pendingEvents ?? 0} pending{" "}
            {pendingEvents === 1 ? "request" : "requests"}.
          </p>
        </Link>
      </div>
    </div>
  );
}
