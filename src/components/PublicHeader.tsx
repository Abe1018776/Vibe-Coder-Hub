"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, Users, Star, LogIn, LayoutDashboard, BookOpen, Briefcase, Trophy } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import LocaleSwitcher from "@/components/LocaleSwitcher";

type NavKey = "competitions" | "builders" | "directory" | "showcase" | "docs";

const NAV: { to: string; key: NavKey; Icon: React.ElementType }[] = [
  { to: "/competitions", key: "competitions", Icon: Trophy },
  { to: "/freelancers", key: "builders", Icon: Users },
  { to: "/directory", key: "directory", Icon: Briefcase },
  { to: "/showcase", key: "showcase", Icon: Star },
  { to: "/docs", key: "docs", Icon: BookOpen },
];

function NavLink({
  to,
  label,
  Icon,
  onClick,
}: {
  to: string;
  label: string;
  Icon: React.ElementType;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === to || pathname.startsWith(to + "/");
  return (
    <Link href={to} onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        )}
      >
        <Icon size={14} />
        {label}
      </div>
    </Link>
  );
}

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-40 h-13 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center gap-4">
        <Link href="/">
          <span className="font-bold text-sm tracking-tight cursor-pointer whitespace-nowrap">
            {t("brand")}
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 flex-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} Icon={item.Icon} label={t(`nav.${item.key}`)} />
          ))}
        </nav>

        <div className="hidden sm:flex items-center ms-auto gap-2">
          <LocaleSwitcher />
          <SignedOut>
            <Link href="/sign-in">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer">
                <LogIn size={14} />
                {t("signIn")}
              </div>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/admin">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer">
                <LayoutDashboard size={14} />
                {t("dashboard")}
              </div>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <button
          className="sm:hidden ms-auto p-1.5 rounded"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={t("menuToggle")}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          <div className="flex items-center justify-end pb-2 border-b border-border mb-2">
            <LocaleSwitcher />
          </div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              Icon={item.Icon}
              label={t(`nav.${item.key}`)}
              onClick={() => setMobileOpen(false)}
            />
          ))}
          <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer">
              <LogIn size={14} />
              {t("signIn")}
            </div>
          </Link>
        </div>
      )}
    </header>
  );
}
