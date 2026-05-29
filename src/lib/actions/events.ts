"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EventFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(140),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(140).optional(),
  starts_at: z.string().trim().min(1, "Date and time are required"),
  url: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
});

export async function createEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to add an event." };

  const parsed = schema.safeParse({
    title: formData.get("title"),
    description: String(formData.get("description") ?? "") || undefined,
    location: String(formData.get("location") ?? "") || undefined,
    starts_at: String(formData.get("starts_at") ?? ""),
    url: String(formData.get("url") ?? ""),
  });
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === "string" && !fe[k]) fe[k] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors: fe };
  }
  const v = parsed.data;

  const date = new Date(v.starts_at);
  if (Number.isNaN(date.getTime())) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { starts_at: "Enter a valid date and time" },
    };
  }

  const { error } = await supabase.from("events").insert({
    creator_id: user.id,
    title: v.title,
    description: v.description ?? null,
    location: v.location ?? null,
    starts_at: date.toISOString(),
    url: v.url || null,
  });
  if (error) return { error: "Couldn't add your event. Please try again." };

  revalidatePath("/events");
  redirect("/events");
}
