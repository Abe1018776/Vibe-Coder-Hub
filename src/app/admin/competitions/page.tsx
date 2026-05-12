import Link from "next/link";
import { db, competitionsTable, competitionSubmissionsTable } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { Plus, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  judging: "bg-amber-100 text-amber-800",
  closed: "bg-gray-200 text-gray-800",
};

export default async function CompetitionsPage() {
  const { userId } = await auth();
  const rows = await db
    .select({
      comp: competitionsTable,
      subCount: sql<number>`(
        SELECT count(*)::int FROM ${competitionSubmissionsTable}
        WHERE ${competitionSubmissionsTable.competitionId} = ${competitionsTable.id}
      )`.as("sub_count"),
    })
    .from(competitionsTable)
    .where(eq(competitionsTable.createdBy, userId!))
    .orderBy(desc(competitionsTable.createdAt));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            Competitions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {rows.length} competition{rows.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/competitions/new">
          <Button size="sm">
            <Plus size={14} /> New competition
          </Button>
        </Link>
      </div>

      <div className="border border-border rounded-md bg-card overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No competitions yet.{" "}
            <Link href="/admin/competitions/new">
              <span className="text-primary underline cursor-pointer">
                Post your first bounty.
              </span>
            </Link>
          </div>
        ) : (
          rows.map(({ comp, subCount }) => (
            <Link key={comp.id} href={`/admin/competitions/${comp.id}`}>
              <div className="border-b border-border last:border-0 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[comp.status]}`}
                      >
                        {comp.status}
                      </span>
                      <span className="text-xs font-bold text-amber-700">
                        ${comp.prizeAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        deadline {new Date(comp.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm font-semibold truncate">{comp.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {comp.description}
                    </div>
                    {comp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {comp.tags.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <Users size={12} />
                      {subCount}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(comp.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
