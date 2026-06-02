import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type { Profile } from "@/lib/queries";

export type Gig = Tables<"gigs">;
export type GigThread = Tables<"gig_threads">;
export type Message = Tables<"messages">;

type MiniProfile = Pick<Profile, "handle" | "name" | "avatar_url">;
type PosterProfile = Pick<
  Profile,
  "handle" | "name" | "avatar_url" | "show_real_name"
>;
export type GigWithPoster = Gig & { poster: PosterProfile | null };
export type ThreadWithApplicant = GigThread & { applicant: MiniProfile | null };
export type MessageWithSender = Message & { sender: MiniProfile | null };

const GIG_WITH_POSTER =
  "*, poster:profiles!gigs_poster_id_fkey(handle,name,avatar_url,show_real_name)";

export const GIG_TYPE_LABEL: Record<Gig["type"], string> = {
  task: "Task",
  hourly: "Hourly",
  build: "Build",
};

export function gigBudgetLabel(gig: Gig): string | null {
  if (gig.type === "hourly" && gig.hourly_rate != null)
    return `$${gig.hourly_rate}/hr`;
  if (gig.budget_min != null && gig.budget_max != null)
    return `$${gig.budget_min}–$${gig.budget_max}`;
  if (gig.budget_min != null) return `From $${gig.budget_min}`;
  if (gig.budget_max != null) return `Up to $${gig.budget_max}`;
  return null;
}

export async function listGigs(
  opts: {
    status?: Gig["status"];
    type?: Gig["type"];
    page?: number;
    perPage?: number;
  } = {},
): Promise<GigWithPoster[]> {
  const supabase = await createClient();
  let query = supabase.from("gigs").select(GIG_WITH_POSTER);
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.type) query = query.eq("type", opts.type);
  query = query.order("created_at", { ascending: false });
  if (opts.page && opts.perPage) {
    const from = (opts.page - 1) * opts.perPage;
    query = query.range(from, from + opts.perPage - 1);
  }
  const { data } = await query;
  return (data as GigWithPoster[] | null) ?? [];
}

/** Total gigs matching the filters (for pagination). */
export async function countGigs(
  opts: { status?: Gig["status"]; type?: Gig["type"] } = {},
): Promise<number> {
  const supabase = await createClient();
  let query = supabase.from("gigs").select("id", { count: "exact", head: true });
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.type) query = query.eq("type", opts.type);
  const { count } = await query;
  return count ?? 0;
}

export async function getGigBySlug(slug: string): Promise<GigWithPoster | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gigs")
    .select(GIG_WITH_POSTER)
    .eq("slug", slug)
    .maybeSingle();
  return (data as GigWithPoster | null) ?? null;
}

/** Threads on a gig (RLS: returns the poster's view of all threads, or the
 *  applicant's single thread). */
export async function getThreadsForGig(
  gigId: string,
): Promise<ThreadWithApplicant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gig_threads")
    .select(
      "*, applicant:profiles!gig_threads_applicant_id_fkey(handle,name,avatar_url)",
    )
    .eq("gig_id", gigId)
    .order("created_at", { ascending: true });
  return (data as ThreadWithApplicant[] | null) ?? [];
}

export async function getMyThreadForGig(
  gigId: string,
  userId: string,
): Promise<GigThread | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gig_threads")
    .select("*")
    .eq("gig_id", gigId)
    .eq("applicant_id", userId)
    .maybeSingle();
  return data;
}

export async function getThread(
  threadId: string,
): Promise<ThreadWithApplicant | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gig_threads")
    .select(
      "*, applicant:profiles!gig_threads_applicant_id_fkey(handle,name,avatar_url)",
    )
    .eq("id", threadId)
    .maybeSingle();
  return (data as ThreadWithApplicant | null) ?? null;
}

export async function getMessages(
  threadId: string,
): Promise<MessageWithSender[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select(
      "*, sender:profiles!messages_sender_id_fkey(handle,name,avatar_url)",
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  return (data as MessageWithSender[] | null) ?? [];
}
