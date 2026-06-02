import Link from "next/link";
import type { Metadata } from "next";
import {
  Pencil,
  Bell,
  ExternalLink,
  BookOpen,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/current-user";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Panel, PanelLabel } from "@/components/brand/panel";
import { Pill } from "@/components/brand/pill";
import { Sparkle } from "@/components/brand/sparkle";
import { accentFor } from "@/lib/site";
import { signOut } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Account · Dashboard" };

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-sm">
      <span className="font-medium text-muted-foreground">{k}</span>
      <span className="text-right font-medium text-ink">{v}</span>
    </div>
  );
}

function ManageLink({
  href,
  icon: Icon,
  label,
  description,
  external,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-teal-50/60"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700">
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      {external ? (
        <ExternalLink
          size={15}
          className="shrink-0 text-muted-foreground/60 transition-colors group-hover:text-teal-700"
        />
      ) : (
        <ChevronRight
          size={16}
          className="shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-700"
        />
      )}
    </Link>
  );
}

export default async function DashboardAccount() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const accent = accentFor(profile.handle);
  const joined = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
        Account
      </h2>

      {/* Identity */}
      <Panel className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <AvatarCircle
            name={profile.name}
            src={profile.avatar_url}
            size={64}
            accent={accent}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl font-bold text-ink">
                {profile.name}
              </h3>
              {profile.is_verified ? (
                <span title="Verified">
                  <Sparkle size={18} color="var(--gold-500)" />
                </span>
              ) : (
                <Pill accent="neutral">Member</Pill>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.handle}</p>
          </div>
          <Link href="/settings/profile" className="btn btn-ghost btn-sm">
            <Pencil size={15} /> Edit
          </Link>
        </div>

        <div className="mt-4 divide-y divide-border/70 border-t border-border pt-1">
          <Row k="Joined" v={joined} />
          <Row k="Status" v={profile.is_verified ? "Verified" : "Member"} />
        </div>
      </Panel>

      {/* Manage */}
      <Panel className="p-2 sm:p-3">
        <PanelLabel className="px-3 pb-1 pt-2">Manage</PanelLabel>
        <div className="space-y-0.5">
          <ManageLink
            href="/settings/profile"
            icon={Pencil}
            label="Profile & skills"
            description="Edit your bio, links, tools and skills"
          />
          <ManageLink
            href="/settings/notifications"
            icon={Bell}
            label="Notifications"
            description="Choose what you get notified about"
          />
          <ManageLink
            href={`/u/${profile.handle}`}
            icon={ExternalLink}
            label="View public profile"
            description="See how others see you"
            external
          />
          <ManageLink
            href="/docs"
            icon={BookOpen}
            label="How it works"
            description="Learn how YidVibe works"
          />
        </div>
      </Panel>

      <form action={signOut}>
        <button type="submit" className="btn btn-ghost btn-sm text-destructive">
          <LogOut size={15} /> Sign out
        </button>
      </form>
    </div>
  );
}
