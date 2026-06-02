"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Inbox,
  User,
  X,
  LayoutGrid,
  Users,
  Briefcase,
  Trophy,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { NAV_LINKS } from "@/lib/site";
import { PostMenu } from "./post-menu";
import { cn } from "@/lib/utils";

const MORE_ICONS: Record<string, typeof LayoutGrid> = {
  "/showcase": LayoutGrid,
  "/builders": Users,
  "/directory": Compass,
  "/gigs": Briefcase,
  "/competitions": Trophy,
  "/events": Calendar,
  "/docs": HelpCircle,
};

/**
 * App-style bottom tab bar for phones + tablets (`lg:hidden`):
 * Home · Explore (boards sheet) · ＋ post · Inbox · You (dashboard).
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        <Tab href="/" label="Home" Icon={Home} active={pathname === "/"} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-2 text-muted-foreground"
          aria-label="Explore"
        >
          <Compass size={20} />
          <span className="text-[11px] font-medium">Explore</span>
        </button>

        <PostMenu variant="fab" />

        <Tab
          href="/dashboard/inbox"
          label="Inbox"
          Icon={Inbox}
          active={isActive("/dashboard/inbox")}
        />
        <Tab
          href="/dashboard"
          label="You"
          Icon={User}
          active={pathname === "/dashboard"}
        />
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-surface p-5 pb-8 shadow-float">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-ink">Explore</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="icon-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((l) => {
                const Icon = MORE_ICONS[l.href] ?? Compass;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-[15px]",
                      isActive(l.href)
                        ? "border-teal-100 bg-teal-50 text-teal-800"
                        : "border-border text-ink hover:bg-secondary",
                    )}
                  >
                    <Icon size={18} className="shrink-0 opacity-80" />
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Tab({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 py-2",
        active ? "text-teal-700" : "text-muted-foreground",
      )}
    >
      <Icon size={20} />
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
