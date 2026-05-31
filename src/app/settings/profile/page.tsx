import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { Container, Eyebrow } from "@/components/brand/layout";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = { title: "Edit profile" };

export default async function SettingsProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/settings/profile");

  return (
    <Container className="max-w-2xl py-12 md:py-16">
      <div className="text-center">
        <Eyebrow>Your builder profile</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight text-ink">
          Your profile
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[17px] text-muted-foreground">
          Set up your builder profile to get discovered by clients and the
          community.
        </p>
      </div>
      <div className="mt-9 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:p-8">
        <ProfileForm profile={profile} />
      </div>
    </Container>
  );
}
