"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUnlocked } from "@/lib/admin";

export type EventRequestState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/** Anyone can request that an event be posted; admins review it. */
export async function requestEvent(
  _prev: EventRequestState,
  formData: FormData,
): Promise<EventRequestState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = String(formData.get("title") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Event title is required.";
  if (!details) fieldErrors.details = "Add some details about the event.";
  if (!contact) fieldErrors.contact = "Add an email or phone so we can reach you.";
  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the highlighted fields below.", fieldErrors };
  }

  const { error } = await supabase.from("event_requests").insert({
    title: title.slice(0, 200),
    details: details.slice(0, 4000),
    contact: contact.slice(0, 200),
    requester_id: user?.id ?? null,
  });
  if (error) return { error: "Couldn't send your request. Please try again." };
  return { ok: true };
}

/** Admin-only: mark an event request handled (approved) or rejected. */
export async function setEventRequestStatus(
  id: string,
  status: "approved" | "rejected",
) {
  await requireAdminUnlocked();
  const supabase = await createClient();
  await supabase.from("event_requests").update({ status }).eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath("/admin");
}
