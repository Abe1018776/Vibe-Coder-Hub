import Link from "next/link";
import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { getMyConversations } from "@/lib/conversations";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Panel } from "@/components/brand/panel";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Inbox · Dashboard" };

export default async function DashboardInbox() {
  const convos = await getMyConversations();

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        Inbox
      </h1>

      {convos.length === 0 ? (
        <Panel className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-teal-700">
            <MessageCircle size={22} />
          </span>
          <p className="text-sm text-muted-foreground">
            No notes yet. When someone sends you a private note — or you send one
            from a builder&apos;s profile — it&apos;ll appear here.
          </p>
        </Panel>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
          <ul className="divide-y divide-border">
            {convos.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/inbox/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary"
                >
                  <AvatarCircle
                    name={c.other.name}
                    src={c.other.avatar_url}
                    size={40}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {c.other.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{c.other.handle}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(c.last_message_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
