import Link from "next/link";
import { Flag } from "lucide-react";
import { requireAdminUnlocked } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  await requireAdminUnlocked();
  const supabase = await createClient();
  const { count } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

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
      </div>
    </div>
  );
}
