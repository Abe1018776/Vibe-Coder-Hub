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
      <Container className="max-w-5xl py-7 md:py-9">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
            Your dashboard
          </p>
          <h1 className="mt-1 font-display text-[26px] font-bold tracking-tight text-ink sm:text-3xl">
            Hi, {profile.name.split(" ")[0]}
          </h1>
        </div>
        <DashboardTabs unread={unread} />
        <div className="mt-7">{children}</div>
      </Container>
    </div>
  );
}
