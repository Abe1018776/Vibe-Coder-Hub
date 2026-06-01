import { createClient } from "@/lib/supabase/server";
import { getProfileStats } from "@/lib/queries";

export type DashboardStats = {
  projects: number;
  upvotes: number;
  gigs: number;
  competitions: number;
  events: number;
  saved: number;
};

/** Counts for the dashboard overview (the signed-in user's own activity). */
export async function getDashboardStats(
  profileId: string,
): Promise<DashboardStats> {
  const supabase = await createClient();
  const [base, gigs, competitions, events, saved] = await Promise.all([
    getProfileStats(profileId),
    supabase
      .from("gigs")
      .select("*", { count: "exact", head: true })
      .eq("poster_id", profileId),
    supabase
      .from("competitions")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", profileId),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", profileId),
    supabase
      .from("saves")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profileId),
  ]);

  return {
    projects: base.projects,
    upvotes: base.upvotes,
    gigs: gigs.count ?? 0,
    competitions: competitions.count ?? 0,
    events: events.count ?? 0,
    saved: saved.count ?? 0,
  };
}
