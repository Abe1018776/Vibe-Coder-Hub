import Link from "next/link";
import type { Metadata } from "next";
import {
  Pencil,
  Bell,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/current-user";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Panel, PanelLabel } from "@/components/brand/panel";
import { Pill } from "@/components/brand/pill";
import { signOut } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Account · Dashboard" };

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-3 text-sm last:border-0">
      <span className="font-medium text-muted-foreground">{k}</span>
      <span className="font-medium text-ink">{v}</span>
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
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        Account
      </h1>

      {/* Identity card — avatar anchors who you're signed in as. */}
      <Panel>
        <div className="flex items-center gap-4">
          <AvatarCircle
            name={profile.name}
            src={profile.avatar_url}
            size={56}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-display text-lg font-bold text-ink">
                {profile.name}
              </p>
              {profile.is_verified ? (
                <Pill accent="gold">
                  <ShieldCheck size={12} className="mr-1" /> Verified
                </Pill>
              ) : (
                <Pill accent="teal">Member</Pill>
              )}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              @{profile.handle}
            </p>
          </div>
          <Link
            href={`/u/${profile.handle}`}
            className="btn btn-ghost btn-sm shrink-0"
          >
            <ExternalLink size={15} /> View public profile
          </Link>
        </div>
      </Panel>

      <Panel>
        <PanelLabel>Account details</PanelLabel>
        <div className="mt-2">
          <Row k="Name" v={profile.name} />
          <Row k="Username" v={`@${profile.handle}`} />
          <Row k="Joined" v={joined} />
          <Row k="Status" v={profile.is_verified ? "Verified" : "Member"} />
        </div>
      </Panel>

      <Panel>
        <PanelLabel>Manage</PanelLabel>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href="/settings/profile" className="btn btn-gold btn-sm">
            <Pencil size={15} /> Edit profile &amp; skills
          </Link>
          <Link
            href="/settings/notifications"
            className="btn btn-ghost btn-sm"
          >
            <Bell size={15} /> Notification settings
          </Link>
        </div>
      </Panel>

      <Panel>
        <PanelLabel>Session</PanelLabel>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-ink">@{profile.handle}</span>.
        </p>
        <form action={signOut} className="mt-3">
          <button type="submit" className="btn btn-ghost btn-sm">
            <LogOut size={15} /> Sign out
          </button>
        </form>
      </Panel>

      {!profile.is_verified && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles size={13} className="text-gold-deep" />
          Building in public? Verified builders stand out across YidVibe.
        </p>
      )}
    </div>
  );
}
