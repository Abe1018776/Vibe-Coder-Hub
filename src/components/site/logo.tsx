import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { LogoMark } from "@/components/brand/sparkle";
import { cn } from "@/lib/utils";

/**
 * Brand lockup: the crossing-strokes + sparkle figure mark next to the
 * Comfortaa wordmark. Links home.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} home`}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <LogoMark size={32} />
      <span className="font-display text-[1.4rem] font-semibold leading-none tracking-tight text-ink">
        {SITE_NAME}
      </span>
    </Link>
  );
}
