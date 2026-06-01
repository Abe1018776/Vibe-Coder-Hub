"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { goPublic } from "@/lib/visibility";

export type CommentFormState = { error?: string; ok?: boolean };

export async function addComment(
  projectId: string,
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to comment." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write something first." };
  if (body.length > 2000) return { error: "That comment is too long." };

  const anon = formData.get("is_anonymous") != null;
  const { error } = await supabase.from("comments").insert({
    project_id: projectId,
    author_id: user.id,
    body,
    is_anonymous: anon,
  });
  if (error) return { error: "Couldn't post your comment. Please try again." };

  // Commenting under your name makes your profile public (anonymous doesn't).
  if (!anon) await goPublic(supabase, user.id);

  revalidatePath(`/showcase/${projectId}`);
  return { ok: true };
}

export async function deleteComment(commentId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id);

  revalidatePath(`/showcase/${projectId}`);
}
