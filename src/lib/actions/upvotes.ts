"use server";

import { createClient } from "@/lib/supabase/server";

export type UpvoteResult =
  | { ok: true; upvoted: boolean }
  | { ok: false; error: "auth" | "failed" };

/** Toggle the current user's upvote on a project. DB UNIQUE enforces one per user. */
export async function toggleUpvote(projectId: string): Promise<UpvoteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const { data: existing } = await supabase
    .from("upvotes")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("upvotes")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: "failed" };
    return { ok: true, upvoted: false };
  }

  const { error } = await supabase
    .from("upvotes")
    .insert({ project_id: projectId, user_id: user.id });
  // Ignore unique-violation races: it just means it's already upvoted.
  if (error && error.code !== "23505") return { ok: false, error: "failed" };
  return { ok: true, upvoted: true };
}
