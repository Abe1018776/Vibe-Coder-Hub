import { useGetStats, useGetRecentActivity } from "@workspace/api-client-react";
import { getGetStatsQueryKey, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Users, Calendar, Star, MessageSquare, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="border border-border rounded-md p-4 bg-card flex items-center gap-4" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className={`p-2.5 rounded-md ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

const ACTIVITY_LABELS: Record<string, string> = {
  gig_created: "Gig posted",
  reply_received: "Reply received",
  freelancer_added: "Freelancer added",
  slot_posted: "Slot available",
  showcase_submitted: "Showcase submitted",
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground" data-testid="page-title-dashboard">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your internal Vibe Coder ops hub</p>
      </div>

      {/* Stats grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <StatCard label="Total Gigs" value={stats.totalGigs} icon={Briefcase} color="bg-primary" />
            <StatCard label="Open Gigs" value={stats.openGigs} icon={TrendingUp} color="bg-green-600" />
            <StatCard label="Freelancers" value={stats.totalFreelancers} icon={Users} color="bg-blue-600" />
            <StatCard label="Open Slots" value={stats.openSlots} icon={Calendar} color="bg-purple-600" />
            <StatCard label="Replies" value={stats.totalReplies} icon={MessageSquare} color="bg-amber-600" />
            <StatCard label="Showcase" value={stats.totalShowcaseProjects} icon={Star} color="bg-rose-600" />
          </div>

          {/* Gig type breakdown */}
          <div className="border border-border rounded-md p-4 bg-card mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">Gig type breakdown</h2>
            <div className="flex gap-6">
              {Object.entries(stats.gigsByType ?? {}).map(([type, count]) => (
                <div key={type} data-testid={`gig-type-${type}`}>
                  <div className="text-lg font-bold text-foreground">{count as number}</div>
                  <div className="text-xs text-muted-foreground capitalize">{type}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Recent activity */}
      <div className="border border-border rounded-md bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
        </div>
        {activityLoading ? (
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
          </div>
        ) : activity && activity.length > 0 ? (
          <ul className="divide-y divide-border">
            {activity.map((item) => (
              <li key={item.id} className="px-4 py-3 flex items-start gap-3" data-testid={`activity-item-${item.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground shrink-0 mt-0.5">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">No activity yet</div>
        )}
      </div>
    </div>
  );
}
