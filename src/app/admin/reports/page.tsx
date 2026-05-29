import Link from "next/link";
import { requireAdminUnlocked } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { AdminReportActions } from "@/components/admin/admin-report-actions";
import { formatRelativeTime } from "@/lib/utils";

type ReportRow = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  created_at: string;
  reporter: { handle: string; name: string } | null;
};

export default async function AdminReportsPage() {
  await requireAdminUnlocked();
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select(
      "id,target_type,target_id,reason,details,created_at, reporter:profiles!reports_reporter_id_fkey(handle,name)",
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });
  const reports = (data as ReportRow[] | null) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Open reports</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Hide (reversible, projects/comments), delete (permanent), or dismiss.
      </p>

      {reports.length === 0 ? (
        <p className="mt-8 rounded-card border border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
          No open reports. 🎉
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-card border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-clay-tint px-2.5 py-0.5 text-xs font-medium text-clay-deep">
                  {r.reason}
                </span>
                <span className="text-muted-foreground">
                  {r.target_type}
                </span>
                {r.target_type === "project" ? (
                  <Link
                    href={`/showcase/${r.target_id}`}
                    className="font-mono text-xs text-teal-700 hover:underline"
                  >
                    {r.target_id.slice(0, 8)}…
                  </Link>
                ) : (
                  <span className="font-mono text-xs text-muted-foreground">
                    {r.target_id.slice(0, 8)}…
                  </span>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatRelativeTime(r.created_at)}
                </span>
              </div>

              {r.details && (
                <p className="mt-2 text-sm text-ink/90">{r.details}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Reported by {r.reporter?.name ?? "someone"}
                {r.reporter?.handle ? ` (@${r.reporter.handle})` : ""}
              </p>

              <div className="mt-3">
                <AdminReportActions reportId={r.id} targetType={r.target_type} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
