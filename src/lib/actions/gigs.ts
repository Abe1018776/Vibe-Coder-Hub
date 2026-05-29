"use server";

import { z } from "zod";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export type GigFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const schema = z.object({
  type: z.enum(["task", "hourly", "build"]),
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().min(1, "Description is required").max(4000),
  loom_url: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
});

function num(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function csv(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createGig(
  _prev: GigFormState,
  formData: FormData,
): Promise<GigFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to post a gig." };

  const parsed = schema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    loom_url: String(formData.get("loom_url") ?? ""),
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
  const slug = `${slugify(v.title) || "gig"}-${nanoid(6)}`;

  const { error } = await supabase.from("gigs").insert({
    poster_id: user.id,
    type: v.type,
    title: v.title,
    description: v.description,
    budget_min: v.type === "hourly" ? null : num(formData.get("budget_min")),
    budget_max: v.type === "hourly" ? null : num(formData.get("budget_max")),
    hourly_rate: v.type === "hourly" ? num(formData.get("hourly_rate")) : null,
    tags: csv(formData.get("tags")),
    loom_url: v.loom_url || null,
    slug,
  });

  if (error) return { error: "Couldn't post your gig. Please try again." };

  revalidatePath("/gigs");
  redirect(`/gigs/${slug}`);
}

/** Apply to a gig: open (or reuse) the private thread, then go to it. */
export async function applyToGig(gigId: string, slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/gigs/${slug}`);

  const existing = await supabase
    .from("gig_threads")
    .select("id")
    .eq("gig_id", gigId)
    .eq("applicant_id", user.id)
    .maybeSingle();

  if (existing.data) {
    redirect(`/gigs/${slug}/thread/${existing.data.id}`);
  }

  const { data, error } = await supabase
    .from("gig_threads")
    .insert({ gig_id: gigId, applicant_id: user.id })
    .select("id")
    .single();

  // RLS blocks applying to your own gig; just send them back to the gig.
  if (error || !data) redirect(`/gigs/${slug}`);

  redirect(`/gigs/${slug}/thread/${data.id}`);
}

export type MessageState = { error?: string; ok?: boolean };

export async function sendMessage(
  threadId: string,
  slug: string,
  _prev: MessageState,
  formData: FormData,
): Promise<MessageState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a message first." };
  if (body.length > 4000) return { error: "That message is too long." };

  const { error } = await supabase
    .from("messages")
    .insert({ thread_id: threadId, sender_id: user.id, body });
  if (error) return { error: "Couldn't send. Please try again." };

  revalidatePath(`/gigs/${slug}/thread/${threadId}`);
  return { ok: true };
}

export async function setGigStatus(
  gigId: string,
  slug: string,
  status: "open" | "in_progress" | "closed",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("gigs")
    .update({ status })
    .eq("id", gigId)
    .eq("poster_id", user.id);

  revalidatePath(`/gigs/${slug}`);
  revalidatePath("/gigs");
}
