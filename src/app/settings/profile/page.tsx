import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = { title: "Edit profile" };

export default async function SettingsProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/settings/profile");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl text-ink">Your profile</h1>
      <p className="mt-2 text-muted-foreground">
        Set up your builder profile to get discovered by clients and the
        community.
      </p>
      <div className="mt-8 rounded-card border border-border bg-surface p-6 md:p-8">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
