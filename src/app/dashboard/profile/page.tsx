import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = { title: "Profile · Dashboard" };

export default async function DashboardProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/profile");

  return (
    <div className="mx-auto max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          Profile
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          How you appear to clients and the community.
        </p>
      </div>
      <div className="mt-6">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
