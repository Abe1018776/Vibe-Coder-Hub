import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { getUnreadReplyCount } from "@/lib/conversations";
import { Container } from "@/components/brand/layout";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const unread = await getUnreadReplyCount();

  return (
    <div className="min-h-[70vh] bg-canvas">
      {/* Sticky chrome: greeting + tab rail stay pinned while content scrolls under. */}
      <div className="sticky top-0 z-30 border-b border-border/70 bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70">
        <Container className="max-w-5xl">
          <div className="flex flex-col gap-4 pb-3 pt-5 md:pb-4 md:pt-7">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
                Your dashboard
              </p>
              <h1 className="mt-1 font-display text-[22px] font-bold tracking-tight text-ink sm:text-[26px]">
                Hi, {profile.name.split(" ")[0]}
              </h1>
            </div>
            <DashboardTabs unread={unread} />
          </div>
        </Container>
      </div>

      <Container className="max-w-5xl pb-12 pt-7 md:pt-8">{children}</Container>
    </div>
  );
}
