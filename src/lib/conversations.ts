import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/current-user";
import type { Tables } from "@/lib/supabase/types";

export type Conversation = Tables<"conversations">;
export type ConversationMessage = Tables<"conversation_messages">;
export type ConvoParticipant = {
  id: string;
  handle: string;
  name: string;
  avatar_url: string | null;
};

/** Normalize a participant pair so (a,b) is unique regardless of who starts. */
function orderPair(x: string, y: string): [string, string] {
  return x < y ? [x, y] : [y, x];
}

export type CanMessage =
  | { ok: true }
  | { ok: false; reason: "sign-in" | "self" | "blocked"; message: string };

/** Whether the signed-in user may open a private note to `target`. */
export async function canMessage(
  target: Pick<Tables<"profiles">, "id" | "dm_privacy">,
): Promise<CanMessage> {
  const me = await getCurrentProfile();
  if (!me) return { ok: false, reason: "sign-in", message: "Sign in to send a note." };
  if (me.id === target.id)
    return { ok: false, reason: "self", message: "This is you." };
  if (target.dm_privacy === "none")
    return {
      ok: false,
      reason: "blocked",
      message: "This person isn't accepting private notes right now.",
    };
  if (target.dm_privacy === "followers") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("follows")
      .select("builder_id")
      .eq("follower_id", me.id)
      .eq("builder_id", target.id)
      .maybeSingle();
    if (!data)
      return {
        ok: false,
        reason: "blocked",
        message: "This person only takes notes from people they're connected with.",
      };
  }
  return { ok: true };
}

/** Find or create the conversation between the current user and `otherId`. */
export async function getOrCreateConversation(
  otherId: string,
  about?: { type: string; id: string },
): Promise<string | null> {
  const me = await getCurrentProfile();
  if (!me || me.id === otherId) return null;
  const supabase = await createClient();
  const [a, b] = orderPair(me.id, otherId);

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant_a", a)
    .eq("participant_b", b)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("conversations")
    .insert({
      participant_a: a,
      participant_b: b,
      about_type: about?.type ?? null,
      about_id: about?.id ?? null,
    })
    .select("id")
    .single();
  return created?.id ?? null;
}

/** The signed-in user's conversations, newest activity first. */
export async function getMyConversations(): Promise<
  { id: string; other: ConvoParticipant; last_message_at: string }[]
> {
  const me = await getCurrentProfile();
  if (!me) return [];
  const supabase = await createClient();
  const { data: convos } = await supabase
    .from("conversations")
    .select("id, participant_a, participant_b, last_message_at")
    .order("last_message_at", { ascending: false });
  if (!convos || convos.length === 0) return [];

  const otherIds = convos.map((c) =>
    c.participant_a === me.id ? c.participant_b : c.participant_a,
  );
  const { data: people } = await supabase
    .from("profiles")
    .select("id, handle, name, avatar_url")
    .in("id", otherIds);
  const byId = new Map((people ?? []).map((p) => [p.id, p]));

  return convos
    .map((c) => {
      const otherId = c.participant_a === me.id ? c.participant_b : c.participant_a;
      const other = byId.get(otherId);
      if (!other) return null;
      return { id: c.id, other, last_message_at: c.last_message_at };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

/** A single conversation + its messages (RLS ensures the caller is a participant). */
export async function getConversation(conversationId: string): Promise<{
  conversation: Conversation;
  other: ConvoParticipant;
  messages: ConversationMessage[];
  meId: string;
} | null> {
  const me = await getCurrentProfile();
  if (!me) return null;
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conversation) return null;

  const otherId =
    conversation.participant_a === me.id
      ? conversation.participant_b
      : conversation.participant_a;
  const { data: other } = await supabase
    .from("profiles")
    .select("id, handle, name, avatar_url")
    .eq("id", otherId)
    .maybeSingle();
  if (!other) return null;

  const { data: messages } = await supabase
    .from("conversation_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return { conversation, other, messages: messages ?? [], meId: me.id };
}

/** Mark the other person's messages in a conversation as read. */
export async function markConversationRead(conversationId: string): Promise<void> {
  const me = await getCurrentProfile();
  if (!me) return;
  const supabase = await createClient();
  await supabase
    .from("conversation_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", me.id)
    .is("read_at", null);
}

/** Total unread private-reply messages for the signed-in user (for the dashboard). */
export async function getUnreadReplyCount(): Promise<number> {
  const me = await getCurrentProfile();
  if (!me) return 0;
  const supabase = await createClient();
  const { count } = await supabase
    .from("conversation_messages")
    .select("*", { count: "exact", head: true })
    .neq("sender_id", me.id)
    .is("read_at", null);
  return count ?? 0;
}
