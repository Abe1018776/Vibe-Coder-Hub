import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, FOOTER_LINKS } from "@/lib/site";
import { Container } from "@/components/brand/layout";
import { LogoMark } from "@/components/brand/sparkle";

/**
 * Dark teal footer — a clear, premium "the page ends here" band that reads
 * distinctly from the near-white page body.
 */
export function SiteFooter() {
  return (
    <footer className="mt-[var(--space-section)] bg-teal-900 text-teal-100">
      <Container className="flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5 text-sm">
          <LogoMark size={26} />
          <span className="font-display text-lg font-semibold text-white">
            {SITE_NAME}
          </span>
          <span className="hidden text-teal-100/70 sm:inline">
            — {SITE_TAGLINE}
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2.5">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-teal-100/75 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
