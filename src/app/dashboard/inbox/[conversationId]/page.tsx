import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import {
  getConversation,
  markConversationRead,
  type ConversationMessage,
} from "@/lib/conversations";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { NoteComposer } from "@/components/messaging/note-composer";
import { accentFor } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Conversation · Dashboard" };

/** Calendar-day key (local) so we can insert a divider when the day changes. */
function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Friendly day label for the divider: Today / Yesterday / full date. */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: now.getFullYear() === d.getFullYear() ? undefined : "numeric",
  });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

type Row =
  | { kind: "day"; key: string; label: string }
  | {
      kind: "msg";
      msg: ConversationMessage;
      mine: boolean;
      showMeta: boolean; // first of a sender-run (renders avatar + time)
      isLastOfRun: boolean; // rounds the tail corner
    };

/** Flatten messages into render rows with day dividers + sender grouping. */
function buildRows(messages: ConversationMessage[], meId: string): Row[] {
  const rows: Row[] = [];
  let lastDay = "";
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i]!;
    const dk = dayKey(m.created_at);
    if (dk !== lastDay) {
      rows.push({ kind: "day", key: dk, label: dayLabel(m.created_at) });
      lastDay = dk;
    }
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const sameDayPrev = prev && dayKey(prev.created_at) === dk;
    const showMeta = !prev || prev.sender_id !== m.sender_id || !sameDayPrev;
    const sameDayNext = next && dayKey(next.created_at) === dk;
    const isLastOfRun = !next || next.sender_id !== m.sender_id || !sameDayNext;
    rows.push({
      kind: "msg",
      msg: m,
      mine: m.sender_id === meId,
      showMeta,
      isLastOfRun,
    });
  }
  return rows;
}

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
  const accent = accentFor(other.handle);
  const rows = buildRows(messages, meId);
  const firstName = other.name.split(" ")[0];

  return (
    <div className="space-y-3">
      <Link
        href="/dashboard/inbox"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-teal-800"
      >
        <ArrowLeft size={16} /> Back to inbox
      </Link>

      <div className="flex max-h-[calc(100dvh-13rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
        {/* Header — avatar + name + @handle + View profile. Pinned to the card top. */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-5">
          <AvatarCircle
            name={other.name}
            src={other.avatar_url}
            size={42}
            accent={accent}
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/u/${other.handle}`}
              className="block truncate font-display text-[15px] font-bold leading-tight text-ink hover:text-teal-800"
            >
              {other.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              @{other.handle}
            </p>
          </div>
          <Link
            href={`/u/${other.handle}`}
            className="btn btn-ghost btn-sm shrink-0"
          >
            <span className="hidden sm:inline">View profile</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Messages — scrolls under the pinned header + composer. */}
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto bg-canvas/40 px-3 py-5 sm:px-5">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                <MessageCircle size={24} />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-ink">
                Start the conversation
              </p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Say hello to {firstName} — write the first note below. It stays
                private between the two of you.
              </p>
            </div>
          ) : (
            rows.map((row) => {
              if (row.kind === "day") {
                return (
                  <div
                    key={`day-${row.key}`}
                    className="my-3 flex items-center gap-3"
                  >
                    <span className="h-px flex-1 bg-border" />
                    <span className="rounded-full bg-surface px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground shadow-[var(--shadow-xs)]">
                      {row.label}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                );
              }

              const { msg, mine, showMeta, isLastOfRun } = row;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end gap-2",
                    mine ? "justify-end" : "justify-start",
                    showMeta ? "mt-2.5 first:mt-0" : "mt-0.5",
                  )}
                >
                  {/* Avatar gutter for incoming messages (only on run start) */}
                  {!mine &&
                    (showMeta ? (
                      <AvatarCircle
                        name={other.name}
                        src={other.avatar_url}
                        size={28}
                        accent={accent}
                        className="mb-4"
                      />
                    ) : (
                      <span className="w-7 shrink-0" aria-hidden />
                    ))}

                  <div
                    className={cn(
                      "flex max-w-[78%] flex-col",
                      mine ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2 text-[14.5px] leading-relaxed shadow-[var(--shadow-xs)]",
                        mine
                          ? "bg-teal-600 text-white"
                          : "border border-border bg-surface text-ink",
                        // flatten the tail corner of the last bubble in a run
                        isLastOfRun &&
                          (mine ? "rounded-br-md" : "rounded-bl-md"),
                      )}
                    >
                      <p className="whitespace-pre-line break-words" dir="auto">
                        {msg.body}
                      </p>
                    </div>
                    {isLastOfRun && (
                      <p
                        className={cn(
                          "mt-1 px-1 text-[11px] text-muted-foreground",
                          mine ? "text-right" : "text-left",
                        )}
                      >
                        {timeLabel(msg.created_at)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Composer — pinned to the card bottom. */}
        <div className="sticky bottom-0 border-t border-border bg-surface px-3 py-3 sm:px-5">
          <NoteComposer conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}
