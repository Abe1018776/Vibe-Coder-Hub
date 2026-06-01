import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/current-user";
import { Panel, PanelLabel } from "@/components/brand/panel";
import { signOut } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Account · Dashboard" };

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 text-sm last:border-0">
      <span className="font-medium text-muted-foreground">{k}</span>
      <span className="text-ink">{v}</span>
    </div>
  );
}

export default async function DashboardAccount() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const joined = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        Account
      </h1>

      <Panel>
        <PanelLabel>Your account</PanelLabel>
        <div className="mt-2">
          <Row k="Name" v={profile.name} />
          <Row k="Username" v={`@${profile.handle}`} />
          <Row k="Joined" v={joined} />
          <Row
            k="Status"
            v={profile.is_verified ? "Verified" : "Member"}
          />
        </div>
      </Panel>

      <Panel>
        <PanelLabel>Manage</PanelLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/settings/profile" className="btn btn-ghost btn-sm">
            Edit profile
          </Link>
          <Link href="/settings/notifications" className="btn btn-ghost btn-sm">
            Notification settings
          </Link>
          <Link href={`/u/${profile.handle}`} className="btn btn-ghost btn-sm">
            View public profile
          </Link>
        </div>
      </Panel>

      <form action={signOut}>
        <button type="submit" className="btn btn-ghost btn-sm">
          Sign out
        </button>
      </form>
    </div>
  );
}
