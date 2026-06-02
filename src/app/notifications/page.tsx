import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { getAuthUser } from "@/lib/current-user";
import { getNotifications, describeNotification } from "@/lib/notifications";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { EmptyState } from "@/components/brand/empty-state";
import { MarkReadOnView } from "@/components/site/mark-read-on-view";
import { formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/notifications");

  const items = await getNotifications(50);
  const hasUnread = items.some((n) => n.read_at == null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <MarkReadOnView hasUnread={hasUnread} />

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Notifications</h1>
        <Link
          href="/settings/notifications"
          className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-sm text-ink transition-colors hover:bg-secondary"
        >
          <Settings size={15} /> Settings
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Nothing yet"
          description="Upvotes, comments, messages, and interest in your projects will show up here."
        />
      ) : (
        <ul className="mt-6 space-y-1">
          {items.map((n) => {
            const { text, href } = describeNotification(n);
            return (
              <li key={n.id}>
                <Link
                  href={href}
                  className={`flex gap-3 rounded-card border border-transparent px-3 py-3 transition-colors hover:bg-secondary ${
                    n.read_at == null ? "bg-teal-50/60" : ""
                  }`}
                >
                  <AvatarCircle
                    name={n.actor?.name ?? "?"}
                    src={n.actor?.avatar_url ?? null}
                    size={36}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-ink">{text}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelativeTime(n.created_at)}
                    </p>
                  </div>
                  {n.read_at == null && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-600" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
