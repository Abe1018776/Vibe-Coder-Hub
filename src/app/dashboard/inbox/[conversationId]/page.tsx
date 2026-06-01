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
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <AvatarCircle name={other.name} src={other.avatar_url} size={44} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${other.handle}`}
            className="font-semibold text-ink hover:underline"
          >
            {other.name}
          </Link>
          <p className="text-xs text-muted-foreground">@{other.handle}</p>
        </div>
        <Link href={`/u/${other.handle}`} className="btn btn-ghost btn-sm">
          View profile <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
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
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                    mine ? "bg-teal-600 text-white" : "bg-secondary text-ink",
                  )}
                >
                  <p className="whitespace-pre-line" dir="auto">
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
