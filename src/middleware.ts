import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdmin = createRouteMatcher([
  "/admin(.*)",
  "/api/gigs(.*)",
  "/api/conversations(.*)",
  "/api/availability(.*)",
  "/api/tags(.*)",
  "/api/freelancers(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdmin(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
