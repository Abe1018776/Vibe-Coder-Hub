"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasAnyContact } from "@/lib/site";
import { goPublic } from "@/lib/visibility";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/** Commercial flags from the form — forced off when posting anonymously. */
function commercialFrom(formData: FormData, anon: boolean) {
  return {
    seeking_funding: !anon && formData.get("seeking_funding") != null,
    for_sale: !anon && formData.get("for_sale") != null,
    open_to_partners: !anon && formData.get("open_to_partners") != null,
  };
}

/** Commercial projects must give buyers/investors a way to reach the builder. */
async function contactErrorIfCommercial(
  supabase: SupabaseServer,
  userId: string,
  c: ReturnType<typeof commercialFrom>,
): Promise<string | null> {
  if (!(c.seeking_funding || c.for_sale || c.open_to_partners)) return null;
  const { data } = await supabase
    .from("profiles")
    .select("links")
    .eq("id", userId)
    .maybeSingle();
  if (!hasAnyContact(data?.links as Record<string, string | undefined> | null)) {
    return "Add a public contact method to your profile first (Settings → Contact) so people can reach you about funding, sale, or partnership.";
  }
  return null;
}

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(2000),
  url: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  image_url: z.string().trim().url().optional().or(z.literal("")),
  video_url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

function multi(formData: FormData, key: string): string[] {
  return formData.getAll(key).map(String).map((s) => s.trim()).filter(Boolean);
}

function parse(formData: FormData) {
  return schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    url: String(formData.get("url") ?? ""),
    image_url: String(formData.get("image_url") ?? ""),
    video_url: String(formData.get("video_url") ?? ""),
  });
}

function fieldErrors(parsed: z.SafeParseError<unknown>): ProjectFormState {
  const fe: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fe[key]) fe[key] = issue.message;
  }
  return { error: "Please fix the highlighted fields.", fieldErrors: fe };
}

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to submit a project." };

  const parsed = parse(formData);
  if (!parsed.success) return fieldErrors(parsed);
  const v = parsed.data;
  if (!v.image_url && !v.url) {
    return { error: "Add a cover image or a live link so people can see it." };
  }

  const anon = formData.get("is_anonymous") != null;
  const commercial = commercialFrom(formData, anon);
  const contactError = await contactErrorIfCommercial(
    supabase,
    user.id,
    commercial,
  );
  if (contactError) return { error: contactError };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name: v.name,
      description: v.description,
      url: v.url || null,
      image_url: v.image_url || null,
      video_url: v.video_url || null,
      images: multi(formData, "images").slice(0, 5),
      tools: multi(formData, "tools"),
      tags: multi(formData, "tags"),
      is_anonymous: anon,
      ...commercial,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Couldn't submit your project. Please try again." };
  }

  // Posting under your name makes your profile public (anonymous posts don't).
  if (!anon) await goPublic(supabase, user.id);

  revalidatePath("/showcase");
  redirect(`/showcase/${data.id}?posted=1`);
}

export async function updateProject(
  projectId: string,
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const parsed = parse(formData);
  if (!parsed.success) return fieldErrors(parsed);
  const v = parsed.data;
  if (!v.image_url && !v.url) {
    return { error: "Add a cover image or a live link so people can see it." };
  }

  const anon = formData.get("is_anonymous") != null;
  const commercial = commercialFrom(formData, anon);
  const contactError = await contactErrorIfCommercial(
    supabase,
    user.id,
    commercial,
  );
  if (contactError) return { error: contactError };

  const { error } = await supabase
    .from("projects")
    .update({
      name: v.name,
      description: v.description,
      url: v.url || null,
      image_url: v.image_url || null,
      video_url: v.video_url || null,
      images: multi(formData, "images").slice(0, 5),
      tools: multi(formData, "tools"),
      tags: multi(formData, "tags"),
      is_anonymous: anon,
      ...commercial,
    })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: "Couldn't save your changes. Please try again." };

  if (!anon) await goPublic(supabase, user.id);

  revalidatePath(`/showcase/${projectId}`);
  revalidatePath("/showcase");
  redirect(`/showcase/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("owner_id", user.id);

  revalidatePath("/showcase");
  redirect("/showcase");
}
