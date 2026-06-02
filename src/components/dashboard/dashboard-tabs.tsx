"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FolderOpen,
  Bookmark,
  Inbox,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const TABS: Tab[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/dashboard/posts", label: "My posts", icon: FolderOpen },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard/inbox", label: "Inbox", icon: Inbox },
  { href: "/settings/profile", label: "Profile", icon: UserCog },
  { href: "/dashboard/account", label: "Account", icon: Settings },
];

/**
 * Horizontal section navigation for the dashboard hub. Icon + label tabs with a
 * clear active state and an optional unread badge on the Inbox. Scrolls
 * horizontally on small screens so the rail never wraps untidily.
 */
export function DashboardTabs({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Dashboard sections"
      className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0"
    >
      <div className="flex min-w-max items-center gap-1.5 rounded-full border border-border bg-surface p-1.5 shadow-[var(--shadow-xs)]">
        {TABS.map((t) => {
          const active = t.exact
            ? pathname === t.href
            : pathname.startsWith(t.href);
          const Icon = t.icon;
          const showBadge = t.href === "/dashboard/inbox" && unread > 0;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-teal-700 text-white shadow-[0_1px_2px_rgba(16,32,43,0.12)]"
                  : "text-muted-foreground hover:bg-teal-50 hover:text-teal-800",
              )}
            >
              <Icon
                size={16}
                className={cn(
                  active ? "text-white" : "text-muted-foreground group-hover:text-teal-700",
                )}
              />
              <span>{t.label}</span>
              {showBadge && (
                <span
                  className={cn(
                    "ml-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-bold leading-[18px]",
                    active ? "bg-white/20 text-white" : "bg-gold-500 text-gold-900",
                  )}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
