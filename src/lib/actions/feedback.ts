"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUnlocked } from "@/lib/admin";

export type FeedbackState = { ok?: boolean; error?: string };

const SENTIMENTS = ["like", "dislike", "idea"];

/** Anyone (logged in or out) can send feedback; it lands in the admin queue. */
export async function createFeedback(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Tell us what's on your mind first." };

  const sentimentRaw = String(formData.get("sentiment") ?? "");
  const sentiment = SENTIMENTS.includes(sentimentRaw) ? sentimentRaw : null;
  const pageUrl = String(formData.get("page_url") ?? "").trim();
  const anonymous = formData.get("anonymous") != null;
  const contact = String(formData.get("contact") ?? "").trim();

  const { error } = await supabase.from("feedback").insert({
    body: body.slice(0, 2000),
    sentiment,
    page_url: pageUrl ? pageUrl.slice(0, 300) : null,
    is_anonymous: anonymous,
    submitter_id: anonymous ? null : user?.id ?? null,
    submitter_contact: contact ? contact.slice(0, 200) : null,
  });
  if (error) return { error: "Couldn't send your feedback. Please try again." };
  return { ok: true };
}

/** Admin-only: mark a feedback item handled. */
export async function setFeedbackHandled(id: string) {
  await requireAdminUnlocked();
  const supabase = await createClient();
  await supabase.from("feedback").update({ status: "handled" }).eq("id", id);
  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
}
