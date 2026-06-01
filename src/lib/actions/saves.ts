"use server";

import { createClient } from "@/lib/supabase/server";

export type SaveResult =
  | { ok: true; saved: boolean }
  | { ok: false; error: "auth" | "failed" };

/** Toggle the current user's private save (bookmark) on a project. */
export async function toggleSave(projectId: string): Promise<SaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const { data: existing } = await supabase
    .from("saves")
    .select("project_id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saves")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: "failed" };
    return { ok: true, saved: false };
  }

  const { error } = await supabase
    .from("saves")
    .insert({ project_id: projectId, user_id: user.id });
  // Ignore unique-violation races: it just means it's already saved.
  if (error && error.code !== "23505") return { ok: false, error: "failed" };
  return { ok: true, saved: true };
}
