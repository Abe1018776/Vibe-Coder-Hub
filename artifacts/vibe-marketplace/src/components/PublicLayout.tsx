import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Users, Star, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const PUBLIC_NAV = [
  { to: "/freelancers", label: "Builders", icon: Users },
  { to: "/showcase", label: "Showcase", icon: Star },
];

function NavLink({ to, label, Icon, onClick }: { to: string; label: string; Icon: React.ElementType; onClick?: () => void }) {
  const [location] = useLocation();
  const active = location === to || location.startsWith(to + "/");
  return (
    <Link href={to} onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        )}
      >
        <Icon size={14} />
        {label}
      </div>
    </Link>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-13 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto h-full px-4 flex items-center gap-4">
          {/* Brand */}
          <Link href="/freelancers">
            <span className="font-bold text-sm tracking-tight text-foreground cursor-pointer whitespace-nowrap">
              Vibe Marketplace
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 flex-1">
            {PUBLIC_NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} label={label} Icon={Icon} />
            ))}
          </nav>

          {/* Sign in — desktop */}
          <div className="hidden sm:flex items-center ml-auto">
            <Link href="/sign-in">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer">
                <LogIn size={14} />
                Sign in
              </div>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden ml-auto p-1.5 rounded text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
            {PUBLIC_NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} label={label} Icon={Icon} onClick={() => setMobileOpen(false)} />
            ))}
            <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer">
                <LogIn size={14} />
                Sign in
              </div>
            </Link>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
