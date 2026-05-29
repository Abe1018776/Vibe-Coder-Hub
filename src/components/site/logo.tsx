import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Brand wordmark + clean logo slot. The owner supplies the final mark;
 * until then the Fraunces wordmark stands in.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} home`}
      className={cn(
        "inline-flex items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="font-display text-[1.35rem] leading-none text-ink">
        {SITE_NAME}
      </span>
    </Link>
  );
}
