import type { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/**
 * Flip the user's profile to public on their first non-anonymous, public action
 * (posting a project, commenting under their name, etc.). Idempotent: the
 * `is_public = false` guard means `went_public_at` is only ever stamped once,
 * and anonymous actions should simply not call this.
 */
export async function goPublic(
  supabase: SupabaseServer,
  userId: string,
): Promise<void> {
  await supabase
    .from("profiles")
    .update({ is_public: true, went_public_at: new Date().toISOString() })
    .eq("id", userId)
    .eq("is_public", false);
}
