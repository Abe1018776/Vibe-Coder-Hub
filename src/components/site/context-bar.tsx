"use client";

import { usePathname } from "next/navigation";
import { Container } from "@/components/brand/layout";
import { BackLink } from "@/components/brand/back-link";

/** Top-level destinations + hubs that should NOT show a Back affordance. */
const NO_BACK = new Set([
  "/",
  "/showcase",
  "/builders",
  "/directory",
  "/gigs",
  "/competitions",
  "/events",
  "/docs",
  "/dashboard",
  "/saved",
  "/notifications",
]);

/**
 * Slim bar at the top of the content area carrying the branded Back link on
 * inner/detail pages. Sticky on desktop (where there's no top nav); static on
 * mobile (it sits under the existing top bar).
 */
export function ContextBar() {
  const pathname = usePathname();
  if (NO_BACK.has(pathname)) return null;

  return (
    <div className="border-b border-border/60 bg-canvas/80 backdrop-blur lg:sticky lg:top-0 lg:z-30">
      <Container className="flex h-12 items-center">
        <BackLink />
      </Container>
    </div>
  );
}
