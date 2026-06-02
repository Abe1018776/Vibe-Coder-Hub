import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { getUnreadReplyCount } from "@/lib/conversations";
import { Container } from "@/components/brand/layout";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { DashboardMobileBar } from "@/components/dashboard/dashboard-mobile-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const unread = await getUnreadReplyCount();
  const firstName = profile.name.split(" ")[0];

  return (
    <div className="min-h-[70vh] bg-canvas">
      {/* Sticky chrome: greeting + tab rail (desktop) / greeting-or-back (mobile). */}
      <div className="sticky top-0 z-30 border-b border-border/70 bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70">
        <Container className="max-w-5xl">
          {/* Desktop: greeting + tab rail */}
          <div className="hidden flex-col gap-4 pb-4 pt-7 lg:flex">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
                Your dashboard
              </p>
              <h1 className="mt-1 font-display text-[26px] font-bold tracking-tight text-ink">
                Hi, {firstName}
              </h1>
            </div>
            <DashboardTabs unread={unread} />
          </div>
          {/* Mobile: greeting on hub root / back link on sub-pages */}
          <div className="flex items-center py-3.5 lg:hidden">
            <DashboardMobileBar firstName={firstName} />
          </div>
        </Container>
      </div>

      <Container className="max-w-5xl pb-12 pt-6 md:pt-8">{children}</Container>
    </div>
  );
}
