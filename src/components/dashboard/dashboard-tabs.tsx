"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/posts", label: "My posts" },
  { href: "/saved", label: "Saved" },
  { href: "/dashboard/inbox", label: "Inbox" },
  { href: "/settings/profile", label: "Profile & skills" },
  { href: "/dashboard/account", label: "Account" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/docs", label: "How it works" },
];

/** Top-tab navigation for the dashboard hub. */
export function DashboardTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Dashboard"
      className="-mx-1 flex gap-1.5 overflow-x-auto border-b border-border px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((t) => {
        const active = t.exact
          ? pathname === t.href
          : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
              active
                ? "bg-teal-700 text-white shadow-[var(--shadow-sm)]"
                : "text-muted-foreground hover:bg-secondary hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
