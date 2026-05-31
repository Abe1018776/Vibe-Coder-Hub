import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, FOOTER_LINKS } from "@/lib/site";
import { Container } from "@/components/brand/layout";
import { LogoMark } from "@/components/brand/sparkle";

export function SiteFooter() {
  return (
    <footer className="mt-[var(--space-section)] border-t border-border bg-canvas">
      <Container className="flex flex-col gap-6 py-11 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <LogoMark size={26} />
          <span className="font-display text-lg font-semibold text-ink">
            {SITE_NAME}
          </span>
          <span className="hidden sm:inline">— {SITE_TAGLINE}</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-teal-800"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
