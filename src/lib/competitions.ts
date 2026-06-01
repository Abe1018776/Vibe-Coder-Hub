import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type { Profile } from "@/lib/queries";

export type Competition = Tables<"competitions">;
export type Submission = Tables<"competition_submissions">;

type MiniProfile = Pick<Profile, "handle" | "name" | "avatar_url">;
export type CompetitionWithCreator = Competition & {
  creator: MiniProfile | null;
};
export type CompetitionListItem = CompetitionWithCreator & {
  submission_count: { count: number }[];
};
export type SubmissionWithSubmitter = Submission & {
  submitter: MiniProfile | null;
};

const COMP_WITH_CREATOR =
  "*, creator:profiles!competitions_creator_id_fkey(handle,name,avatar_url)";

export function deadlineLabel(deadline: string): {
  text: string;
  ended: boolean;
} {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { text: "Ended", ended: true };
  const days = Math.floor(diff / 86_400_000);
  if (days >= 1)
    return { text: `${days} day${days === 1 ? "" : "s"} left`, ended: false };
  const hours = Math.floor(diff / 3_600_000);
  if (hours >= 1)
    return { text: `${hours} hour${hours === 1 ? "" : "s"} left`, ended: false };
  const mins = Math.max(1, Math.floor(diff / 60_000));
  return { text: `${mins} min left`, ended: false };
}

export function submissionCount(c: CompetitionListItem): number {
  return c.submission_count?.[0]?.count ?? 0;
}

export async function listCompetitions(
  opts: { page?: number; perPage?: number } = {},
): Promise<CompetitionListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("competitions")
    .select(
      `${COMP_WITH_CREATOR}, submission_count:competition_submissions!competition_submissions_competition_id_fkey(count)`,
    )
    .order("created_at", { ascending: false });
  if (opts.page && opts.perPage) {
    const from = (opts.page - 1) * opts.perPage;
    query = query.range(from, from + opts.perPage - 1);
  }
  const { data } = await query;
  return (data as CompetitionListItem[] | null) ?? [];
}

/** Total competitions (for pagination). */
export async function countCompetitions(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("competitions")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function getCompetitionBySlug(
  slug: string,
): Promise<CompetitionWithCreator | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("competitions")
    .select(COMP_WITH_CREATOR)
    .eq("slug", slug)
    .maybeSingle();
  return (data as CompetitionWithCreator | null) ?? null;
}

export async function getSubmissions(
  competitionId: string,
): Promise<SubmissionWithSubmitter[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("competition_submissions")
    .select(
      "*, submitter:profiles!competition_submissions_submitter_id_fkey(handle,name,avatar_url)",
    )
    .eq("competition_id", competitionId)
    .order("created_at", { ascending: true });
  return (data as SubmissionWithSubmitter[] | null) ?? [];
}
