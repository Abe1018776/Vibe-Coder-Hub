import {
  db,
  gigsTable,
  freelancersTable,
  availabilitySlotsTable,
  showcaseProjectsTable,
  gigMessagesTable,
} from "@/lib/db";
import { eq, sql, desc } from "drizzle-orm";
import { Briefcase, Users, Calendar, Star, MessageSquare, TrendingUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    gigCounts,
    [{ totalFreelancers }],
    [{ openSlots }],
    [{ totalShowcase }],
    [{ totalReplies }],
    recentGigs,
  ] = await Promise.all([
    db
      .select({
        type: gigsTable.type,
        status: gigsTable.status,
        count: sql<number>`count(*)::int`,
      })
      .from(gigsTable)
      .groupBy(gigsTable.type, gigsTable.status),
    db
      .select({ totalFreelancers: sql<number>`count(*)::int` })
      .from(freelancersTable),
    db
      .select({ openSlots: sql<number>`count(*)::int` })
      .from(availabilitySlotsTable)
      .where(eq(availabilitySlotsTable.isBooked, false)),
    db
      .select({ totalShowcase: sql<number>`count(*)::int` })
      .from(showcaseProjectsTable),
    db
      .select({ totalReplies: sql<number>`count(*)::int` })
      .from(gigMessagesTable),
    db.select().from(gigsTable).orderBy(desc(gigsTable.createdAt)).limit(8),
  ]);

  const totalGigs = gigCounts.reduce((s, r) => s + r.count, 0);
  const openGigs = gigCounts
    .filter((r) => r.status === "open")
    .reduce((s, r) => s + r.count, 0);
  const gigsByType = gigCounts.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + r.count;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your internal Vibe Coder ops hub
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Stat label="Total Gigs" value={totalGigs} Icon={Briefcase} color="bg-primary" />
        <Stat label="Open Gigs" value={openGigs} Icon={TrendingUp} color="bg-green-600" />
        <Stat label="Freelancers" value={totalFreelancers} Icon={Users} color="bg-blue-600" />
        <Stat label="Open Slots" value={openSlots} Icon={Calendar} color="bg-purple-600" />
        <Stat label="Replies" value={totalReplies} Icon={MessageSquare} color="bg-amber-600" />
        <Stat label="Showcase" value={totalShowcase} Icon={Star} color="bg-rose-600" />
      </div>

      <div className="border border-border rounded-md p-4 bg-card mb-6">
        <h2 className="text-sm font-semibold mb-3">Gig type breakdown</h2>
        <div className="flex gap-6">
          {(["task", "hourly", "build"] as const).map((type) => (
            <div key={type}>
              <div className="text-lg font-bold">{gigsByType[type] ?? 0}</div>
              <div className="text-xs text-muted-foreground capitalize">{type}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-md bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Recent gigs</h2>
        </div>
        {recentGigs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No gigs yet
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentGigs.map((g) => (
              <li key={g.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{g.title}</div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">
                    {g.type} · {g.status.replace("_", " ")}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 mt-0.5">
                  {formatRelativeTime(g.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  Icon,
  color,
}: {
  label: string;
  value: number;
  Icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="border border-border rounded-md p-4 bg-card flex items-center gap-4">
      <div className={`p-2.5 rounded-md ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
