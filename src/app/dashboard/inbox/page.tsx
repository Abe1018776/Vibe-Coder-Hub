import Link from "next/link";
import type { Metadata } from "next";
import { MessageCircle, ChevronRight } from "lucide-react";
import { getMyConversations } from "@/lib/conversations";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { EmptyState } from "@/components/brand/empty-state";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Inbox · Dashboard" };

export default async function DashboardInbox() {
  const convos = await getMyConversations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          Inbox
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Private notes between you and other builders.
        </p>
      </div>

      {convos.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={22} />}
          title="No notes yet"
          description="When someone sends you a private note — or you send one from a builder's profile — it'll appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
          <ul className="divide-y divide-border">
            {convos.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/inbox/${c.id}`}
                  className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary"
                >
                  <AvatarCircle
                    name={c.other.name}
                    src={c.other.avatar_url}
                    size={42}
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
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
