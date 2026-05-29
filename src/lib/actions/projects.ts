"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
function csv(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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

  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name: v.name,
      description: v.description,
      url: v.url || null,
      image_url: v.image_url || null,
      video_url: v.video_url || null,
      tools: multi(formData, "tools"),
      tags: csv(formData.get("tags")),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Couldn't submit your project. Please try again." };
  }

  revalidatePath("/showcase");
  redirect(`/showcase/${data.id}`);
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

  const { error } = await supabase
    .from("projects")
    .update({
      name: v.name,
      description: v.description,
      url: v.url || null,
      image_url: v.image_url || null,
      video_url: v.video_url || null,
      tools: multi(formData, "tools"),
      tags: csv(formData.get("tags")),
    })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: "Couldn't save your changes. Please try again." };

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
