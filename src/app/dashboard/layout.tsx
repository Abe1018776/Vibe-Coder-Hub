import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { Container } from "@/components/brand/layout";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");

  return (
    <Container className="max-w-5xl py-8">
      <DashboardTabs />
      <div className="mt-6">{children}</div>
    </Container>
  );
}
