"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/current-user";
import { getOrCreateConversation, canMessage } from "@/lib/conversations";

/**
 * Open (or reuse) a private conversation with `otherId` and go to the thread.
 * Bound to its args and used as a <form action>. Re-checks privacy server-side.
 */
export async function startConversation(
  otherId: string,
  about: { type: string; id: string } | undefined,
) {
  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("id, dm_privacy")
    .eq("id", otherId)
    .maybeSingle();
  if (!target) return;
  const allowed = await canMessage(target);
  if (!allowed.ok) return;
  const id = await getOrCreateConversation(otherId, about);
  if (id) redirect(`/dashboard/inbox/${id}`);
}

export type MessageState = { error?: string };

/** Post a message into a conversation (the DB trigger handles notify + bump). */
export async function sendMessage(
  conversationId: string,
  _prev: MessageState,
  formData: FormData,
): Promise<MessageState> {
  const me = await getCurrentProfile();
  if (!me) return { error: "Sign in to reply." };
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write something first." };
  if (body.length > 4000) return { error: "That message is too long." };

  const supabase = await createClient();
  const { error } = await supabase.from("conversation_messages").insert({
    conversation_id: conversationId,
    sender_id: me.id,
    body,
  });
  if (error) return { error: "Couldn't send that — please try again." };

  revalidatePath(`/dashboard/inbox/${conversationId}`);
  return {};
}
