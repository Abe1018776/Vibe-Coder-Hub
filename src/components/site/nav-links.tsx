"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center justify-center gap-0.5">
      {NAV_LINKS.map((l) => {
        const active =
          pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-teal-50 text-teal-800"
                : "text-muted-foreground hover:text-ink",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
