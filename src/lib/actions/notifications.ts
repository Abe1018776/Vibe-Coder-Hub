"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { NOTIFICATION_TYPES } from "@/lib/site";

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
  revalidatePath("/notifications");
  revalidatePath("/", "layout"); // refresh the header bell count
}

export async function updateNotificationPrefs(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const prefs: Record<string, boolean> = {};
  for (const t of NOTIFICATION_TYPES) {
    // Checkbox present (checked) => enabled.
    prefs[t.key] = formData.get(t.key) != null;
  }
  await supabase
    .from("profiles")
    .update({ notification_prefs: prefs })
    .eq("id", user.id);
  revalidatePath("/settings/notifications");
}

export type InterestState = { ok?: boolean; error?: string };

/** Record an "I'm interested" ping (invest/buy/partner); the trigger notifies the owner. */
export async function expressInterest(
  projectId: string,
  kind: string,
): Promise<InterestState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to do that." };

  const { error } = await supabase
    .from("interests")
    .insert({ project_id: projectId, user_id: user.id, kind });
  // 23505 = already expressed this interest; treat as success.
  if (error && error.code !== "23505") {
    return { error: "Couldn't send that just now. Please try again." };
  }
  return { ok: true };
}
