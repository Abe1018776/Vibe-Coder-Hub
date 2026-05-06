import Link from "next/link";
import { db, gigsTable } from "@/lib/db";
import { desc, sql } from "drizzle-orm";
import { Plus, MessageSquare, Clock, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_ICONS: Record<string, React.ElementType> = {
  task: Zap,
  hourly: Clock,
  build: Wrench,
};
const TYPE_COLORS: Record<string, string> = {
  task: "bg-blue-100 text-blue-800",
  hourly: "bg-purple-100 text-purple-800",
  build: "bg-amber-100 text-amber-800",
};
const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  in_progress: "bg-orange-100 text-orange-800",
};

export default async function GigBoardPage() {
  const gigs = await db
    .select({
      gig: gigsTable,
      msgCount: sql<number>`(
        SELECT count(*)::int
        FROM gig_messages m
        JOIN gig_conversations c ON c.id = m.conversation_id
        WHERE c.gig_id = ${gigsTable.id}
      )`.as("msg_count"),
    })
    .from(gigsTable)
    .orderBy(desc(gigsTable.createdAt));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Gig Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {gigs.length} gig{gigs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/gigs/new">
          <Button size="sm">
            <Plus size={14} /> Post Gig
          </Button>
        </Link>
      </div>

      <div className="border border-border rounded-md bg-card overflow-hidden">
        {gigs.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No gigs found.{" "}
            <Link href="/admin/gigs/new">
              <span className="text-primary underline cursor-pointer">
                Post the first one.
              </span>
            </Link>
          </div>
        ) : (
          gigs.map(({ gig, msgCount }) => {
            const Icon = TYPE_ICONS[gig.type] ?? Zap;
            return (
              <Link key={gig.id} href={`/admin/gigs/${gig.id}`}>
                <div className="border-b border-border last:border-0 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${TYPE_COLORS[gig.type]}`}
                        >
                          <Icon size={11} />
                          {gig.type}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[gig.status]}`}
                        >
                          {gig.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-sm font-semibold truncate">{gig.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {gig.description}
                      </div>
                      {gig.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {gig.tags.map((t) => (
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
                        <MessageSquare size={12} />
                        {msgCount}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(gig.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
