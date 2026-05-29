import { cn } from "@/lib/utils";

/**
 * Signature ambient hero: slow-drifting blurred color blobs (teal / dusty blue
 * / warm) behind the content. Pauses under prefers-reduced-motion (see globals).
 */
export function AmbientHero({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="yv-blob yv-blob-a"
          style={{ top: "-12%", left: "-6%", width: 440, height: 440, background: "var(--color-teal-100)" }}
        />
        <div
          className="yv-blob yv-blob-b"
          style={{ top: "-18%", right: "-10%", width: 500, height: 500, background: "var(--color-blue-tint)" }}
        />
        <div
          className="yv-blob yv-blob-c"
          style={{ bottom: "-30%", left: "25%", width: 400, height: 400, background: "var(--color-gold-tint)" }}
        />
      </div>
      {children}
    </section>
  );
}
