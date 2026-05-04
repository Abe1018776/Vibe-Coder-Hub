import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Star,
  Tag,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/gigs", label: "Gig Board", icon: Briefcase },
  { to: "/freelancers", label: "Freelancers", icon: Users },
  { to: "/availability", label: "Availability", icon: Calendar },
  { to: "/showcase", label: "Showcase", icon: Star },
  { to: "/tags", label: "Tags", icon: Tag },
];

function NavItem({ to, label, Icon, onClick }: { to: string; label: string; Icon: React.ElementType; onClick?: () => void }) {
  const [location] = useLocation();
  const active = location === to || (to !== "/" && location.startsWith(to));
  return (
    <Link href={to} onClick={onClick}>
      <div
        data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
          active
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon size={16} />
        {label}
      </div>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-sidebar-border bg-sidebar">
        <div className="px-5 py-4 border-b border-sidebar-border">
          <span className="font-bold text-base tracking-tight text-sidebar-foreground">Vibe Marketplace</span>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} />
          ))}
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 border-b border-border bg-background flex items-center px-4 gap-3">
        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen(!open)}
          className="p-1 rounded text-foreground"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="font-bold text-sm">Vibe Marketplace</span>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
          <aside
            className="w-56 h-full bg-sidebar border-r border-sidebar-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-sidebar-border mt-12">
              <span className="font-bold text-base tracking-tight text-sidebar-foreground">Vibe Marketplace</span>
            </div>
            <nav className="flex flex-col gap-1 p-3 flex-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavItem key={to} to={to} label={label} Icon={Icon} onClick={() => setOpen(false)} />
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-12">
        {children}
      </main>
    </div>
  );
}
