"use client";

import { usePathname } from "next/navigation";
import { Container } from "@/components/brand/layout";
import { BackLink } from "@/components/brand/back-link";

/**
 * Top-level destinations + hubs that should NOT show a Back affordance:
 * home, every board root, and the dashboard root.
 */
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
  "/login",
  "/signup",
]);

/**
 * Explicit fallback for sub-pages whose path parent isn't a real page (so a
 * deep-linked visitor with no in-app history lands somewhere real). `/settings/*`
 * has no `/settings` index, so send it back to the dashboard hub.
 */
function fallbackFor(pathname: string): string | undefined {
  if (pathname.startsWith("/settings/")) return "/dashboard";
  return undefined;
}

/**
 * Slim bar at the top of the content area carrying the branded Back link on
 * inner/detail pages. Sticky on desktop (where there's no top nav); static on
 * mobile (it sits under the existing top bar).
 */
export function ContextBar() {
  const pathname = usePathname();
  // The dashboard navigates via its own tabs (and the chat thread carries its
  // own "Back to inbox"), so the global Back must never appear under /dashboard.
  if (NO_BACK.has(pathname) || pathname.startsWith("/dashboard")) return null;

  return (
    <div className="border-b border-border/60 bg-canvas/80 backdrop-blur lg:sticky lg:top-0 lg:z-30">
      <Container className="flex h-12 items-center">
        <BackLink fallbackHref={fallbackFor(pathname)} />
      </Container>
    </div>
  );
}
