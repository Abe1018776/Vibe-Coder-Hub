import Link from "next/link";
import type { Metadata } from "next";
import { MessageCircle, ChevronRight } from "lucide-react";
import { getMyConversations } from "@/lib/conversations";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Panel } from "@/components/brand/panel";
import { EmptyState } from "@/components/brand/empty-state";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Inbox · Dashboard" };

export default async function DashboardInbox() {
  const convos = await getMyConversations();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          Inbox
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {convos.length === 0
            ? "Private notes with other builders."
            : `${convos.length} conversation${convos.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {convos.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={22} />}
          title="No messages yet"
          description="When someone sends you a private note — or you send one from a builder's profile — the conversation appears here."
        />
      ) : (
        <Panel className="p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {convos.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/inbox/${c.id}`}
                  className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-teal-50/40 sm:px-5"
                >
                  <AvatarCircle
                    name={c.other.name}
                    src={c.other.avatar_url}
                    size={44}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-ink">
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
                    className="shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-700"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
