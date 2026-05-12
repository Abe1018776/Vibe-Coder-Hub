"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Star,
  Tag,
  Trophy,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/competitions", label: "Competitions", Icon: Trophy },
  { to: "/admin/gigs", label: "Gig Board", Icon: Briefcase },
  { to: "/admin/freelancers", label: "Freelancers", Icon: Users },
  { to: "/admin/availability", label: "Availability", Icon: Calendar },
  { to: "/showcase", label: "Showcase", Icon: Star },
  { to: "/admin/tags", label: "Tags", Icon: Tag },
];

function NavItem({
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
  const active =
    pathname === to || (to !== "/admin" && pathname.startsWith(to));
  return (
    <Link href={to} onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
          active
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent",
        )}
      >
        <Icon size={16} />
        {label}
      </div>
    </Link>
  );
}

function SidebarFooter() {
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <div className="p-3 border-t border-sidebar-border">
      {user && (
        <div
          className="px-3 py-1.5 mb-1 text-xs text-sidebar-foreground/60 truncate"
          title={user.primaryEmailAddress?.emailAddress}
        >
          {user.primaryEmailAddress?.emailAddress ?? user.fullName}
        </div>
      )}
      <button
        onClick={() => signOut({ redirectUrl: "/sign-in" })}
        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  );
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-sidebar-border bg-sidebar">
        <div className="px-5 py-4 border-b border-sidebar-border">
          <span className="font-bold text-base tracking-tight text-sidebar-foreground">
            Vibe Coder Hub
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <SidebarFooter />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 border-b border-border bg-background flex items-center px-4 gap-3">
        <button onClick={() => setOpen(!open)} className="p-1 rounded">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="font-bold text-sm">Vibe Coder Hub</span>
      </div>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <aside
            className="w-56 h-full bg-sidebar border-r border-sidebar-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-sidebar-border mt-12">
              <span className="font-bold text-base tracking-tight text-sidebar-foreground">
                Vibe Coder Hub
              </span>
            </div>
            <nav className="flex flex-col gap-1 p-3 flex-1">
              {NAV.map((item) => (
                <NavItem key={item.to} {...item} onClick={() => setOpen(false)} />
              ))}
            </nav>
            <SidebarFooter />
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-auto md:pt-0 pt-12">{children}</main>
    </div>
  );
}
