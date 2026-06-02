import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type { Profile } from "@/lib/queries";

export type EventRow = Tables<"events"> & {
  creator: Pick<Profile, "handle" | "name" | "avatar_url"> | null;
};

/** Upcoming events (starts now or later), soonest first. */
export async function listUpcomingEvents(): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*, creator:profiles!events_creator_id_fkey(handle,name,avatar_url)")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });
  return (data as EventRow[] | null) ?? [];
}

/**
 * Every event — dated and undated — for the calendar board. The board filters
 * and groups client-side, so we hand it the full set ordered soonest-first
 * (undated rows, with a null `starts_at`, sort to the end).
 */
export async function listAllEvents(): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*, creator:profiles!events_creator_id_fkey(handle,name,avatar_url)")
    .order("starts_at", { ascending: true, nullsFirst: false });
  return (data as EventRow[] | null) ?? [];
}
