"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell } from "lucide-react";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { formatRelativeTime, cn } from "@/lib/utils";

export type BellItem = {
  id: string;
  text: string;
  href: string;
  read: boolean;
  createdAt: string;
  actorName: string | null;
  actorAvatar: string | null;
};

export function NotificationBell({
  items,
  unread,
}: {
  items: BellItem[];
  unread: number;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-clay-mid px-1 text-[10px] font-semibold leading-none text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 max-w-[92vw] rounded-xl border border-border bg-surface p-1.5 shadow-float"
        >
          <div className="flex items-center justify-between px-2.5 py-2">
            <span className="text-sm font-medium text-ink">Notifications</span>
            {unread > 0 && (
              <form action={markAllNotificationsRead}>
                <button
                  type="submit"
                  className="text-xs font-medium text-teal-700 hover:underline"
                >
                  Mark all read
                </button>
              </form>
            )}
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          {items.length === 0 ? (
            <p className="px-2.5 py-7 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.map((n) => (
                <DropdownMenu.Item asChild key={n.id}>
                  <Link
                    href={n.href}
                    className={cn(
                      "flex gap-2.5 rounded-lg px-2.5 py-2 outline-none hover:bg-secondary focus:bg-secondary",
                      !n.read && "bg-teal-50/60",
                    )}
                  >
                    <AvatarCircle
                      name={n.actorName ?? "?"}
                      src={n.actorAvatar}
                      size={30}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-ink">{n.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-600" />
                    )}
                  </Link>
                </DropdownMenu.Item>
              ))}
            </div>
          )}

          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            <Link
              href="/notifications"
              className="block rounded-lg px-2.5 py-2 text-center text-sm font-medium text-ink outline-none hover:bg-secondary focus:bg-secondary"
            >
              See all
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
