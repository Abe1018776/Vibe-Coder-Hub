import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Profile = Tables<"profiles">;

/** The authenticated auth.users record, or null when signed out. */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The current user's public profile row, or null when signed out. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data;
}
