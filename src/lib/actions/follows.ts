"use server";

import { createClient } from "@/lib/supabase/server";

export type FollowResult =
  | { ok: true; following: boolean }
  | { ok: false; error: "auth" | "self" | "failed" };

/** Toggle the current user following a builder. The builder only ever sees a
 *  follower count (RLS), never who follows them. */
export async function toggleFollow(builderId: string): Promise<FollowResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };
  if (user.id === builderId) return { ok: false, error: "self" };

  const { data: existing } = await supabase
    .from("follows")
    .select("builder_id")
    .eq("follower_id", user.id)
    .eq("builder_id", builderId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("builder_id", builderId);
    if (error) return { ok: false, error: "failed" };
    return { ok: true, following: false };
  }

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, builder_id: builderId });
  if (error && error.code !== "23505") return { ok: false, error: "failed" };
  return { ok: true, following: true };
}
