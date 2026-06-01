import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getConversation, markConversationRead } from "@/lib/conversations";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { NoteComposer } from "@/components/messaging/note-composer";
import { formatRelativeTime, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Conversation · Dashboard" };

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const data = await getConversation(conversationId);
  if (!data) notFound();
  await markConversationRead(conversationId);

  const { other, messages, meId } = data;

  return (
    <div className="space-y-5">
      {/* Conversation header — a clean card identifying who you're talking to. */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-sm)]">
        <AvatarCircle name={other.name} src={other.avatar_url} size={44} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${other.handle}`}
            className="font-semibold text-ink hover:text-teal-800 hover:underline"
          >
            {other.name}
          </Link>
          <p className="text-xs text-muted-foreground">@{other.handle}</p>
        </div>
        <Link href={`/u/${other.handle}`} className="btn btn-ghost btn-sm shrink-0">
          View profile <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] sm:p-5">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Say hello — send the first note.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === meId;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-[var(--shadow-xs)]",
                    mine
                      ? "rounded-br-md bg-teal-600 text-white"
                      : "rounded-bl-md bg-secondary text-ink",
                  )}
                >
                  <p className="whitespace-pre-line leading-relaxed" dir="auto">
                    {m.body}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      mine ? "text-white/70" : "text-muted-foreground",
                    )}
                  >
                    {formatRelativeTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <NoteComposer conversationId={conversationId} />
    </div>
  );
}
