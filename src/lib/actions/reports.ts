"use server";

import { createClient } from "@/lib/supabase/server";

export type ReportState = { ok?: boolean; error?: string };

const REASONS = ["spam", "inappropriate", "scam", "offensive", "copyright", "other"];
const TARGETS = ["project", "comment", "profile", "gig", "competition", "event"];

/** File a report. Anyone signed in can report; only admins can read/act on them. */
export async function createReport(
  targetType: string,
  targetId: string,
  reason: string,
  details: string,
): Promise<ReportState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to report." };
  if (!TARGETS.includes(targetType) || !REASONS.includes(reason)) {
    return { error: "That report looks invalid." };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
    details: details.trim() ? details.trim().slice(0, 1000) : null,
  });
  if (error) return { error: "Couldn't send the report. Please try again." };
  return { ok: true };
}
