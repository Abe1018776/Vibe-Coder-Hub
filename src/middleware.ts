import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/freelancers",
  "/freelancers/(.*)",
  "/showcase",
  "/showcase/(.*)",
  "/gigs/public/(.*)",
  "/gigs/thread/(.*)",
  "/api/public/(.*)",
  "/api/thread/(.*)",
  "/api/showcase",
  "/api/showcase/(.*)",
  "/api/freelancers",
  "/api/healthz",
  "/api/diag",
  "/admin",
  "/admin/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
