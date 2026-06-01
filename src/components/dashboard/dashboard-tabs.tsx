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
    <div className="flex flex-wrap gap-2 border-b border-border pb-3">
      {TABS.map((t) => {
        const active = t.exact
          ? pathname === t.href
          : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-teal-700 text-white"
                : "border border-border bg-surface text-muted-foreground hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
