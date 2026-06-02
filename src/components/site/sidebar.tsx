"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Compass,
  Briefcase,
  Trophy,
  Calendar,
  HelpCircle,
  Plus,
} from "lucide-react";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { NotificationBell, type BellItem } from "./notification-bell";

const ICONS: Record<string, typeof LayoutGrid> = {
  "/showcase": LayoutGrid,
  "/builders": Users,
  "/directory": Compass,
  "/gigs": Briefcase,
  "/competitions": Trophy,
  "/events": Calendar,
  "/docs": HelpCircle,
};

type SidebarProfile = { handle: string; name: string; avatar_url: string | null };

/**
 * Persistent desktop left rail (lg+). Carries the brand lockup, the primary nav,
 * a Submit action, notifications, and the signed-in user. Mobile keeps the top
 * bar + bottom tab nav instead (this is `hidden lg:flex`).
 */
export function Sidebar({
  profile,
  bellItems,
  unread,
  isAdmin = false,
}: {
  profile: SidebarProfile | null;
  bellItems: BellItem[];
  unread: number;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface px-3 py-4 lg:flex">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV_LINKS.map((l) => {
          const Icon = ICONS[l.href] ?? Compass;
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-teal-50 text-teal-800"
                  : "text-muted-foreground hover:bg-secondary hover:text-ink",
              )}
            >
              <Icon size={18} className="shrink-0" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 space-y-3 border-t border-border pt-3">
        <Link
          href="/showcase/submit"
          className="btn btn-gold btn-sm w-full justify-center"
        >
          <Plus size={16} /> Submit a project
        </Link>
        {profile ? (
          <div className="flex items-center gap-2">
            <UserMenu profile={profile} isAdmin={isAdmin} />
            <Link href="/dashboard" className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {profile.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{profile.handle}
              </p>
            </Link>
            <NotificationBell items={bellItems} unread={unread} />
          </div>
        ) : (
          <Link href="/login" className="btn btn-ghost btn-sm w-full justify-center">
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
