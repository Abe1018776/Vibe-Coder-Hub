import Link from "next/link";
import { db, competitionsTable, competitionSubmissionsTable } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { Trophy, Calendar, DollarSign, Users } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  judging: "bg-amber-100 text-amber-800",
  closed: "bg-gray-200 text-gray-800",
};

export default async function PublicCompetitionsPage() {
  const rows = await db
    .select({
      comp: competitionsTable,
      subCount: sql<number>`(
        SELECT count(*)::int FROM ${competitionSubmissionsTable}
        WHERE ${competitionSubmissionsTable.competitionId} = ${competitionsTable.id}
      )`.as("sub_count"),
    })
    .from(competitionsTable)
    .where(sql`${competitionsTable.status} != 'closed' OR ${competitionsTable.winnerSubmissionId} IS NOT NULL`)
    .orderBy(desc(competitionsTable.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> Competitions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Open bounties — pick one, submit your entry, win the prize.
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="border border-border rounded-md bg-card p-10 text-center text-sm text-muted-foreground">
          No competitions yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rows.map(({ comp, subCount }) => {
            const deadline = new Date(comp.deadline);
            const passed = deadline.getTime() < Date.now();
            return (
              <Link key={comp.id} href={`/competitions/public/${comp.publicSlug}`}>
                <div className="border border-border rounded-md bg-card p-5 hover:border-primary/60 transition-colors h-full cursor-pointer">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[comp.status]}`}>
                      {comp.status}
                    </span>
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-0.5">
                      <DollarSign size={11} />{comp.prizeAmount.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5">{comp.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {comp.description}
                  </p>
                  {comp.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {comp.tags.slice(0, 5).map((t) => (
                        <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
                    <span className={`flex items-center gap-1 ${passed ? "text-destructive" : ""}`}>
                      <Calendar size={11} />
                      {passed ? "Closed " : ""}{deadline.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {subCount} {subCount === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Posted {formatRelativeTime(comp.createdAt)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
