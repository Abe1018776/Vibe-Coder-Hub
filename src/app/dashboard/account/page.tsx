import Link from "next/link";
import type { Metadata } from "next";
import {
  Pencil,
  Bell,
  ExternalLink,
  BookOpen,
  LogOut,
  ChevronRight,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/current-user";
import { getAdminContext } from "@/lib/admin";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Panel, PanelLabel } from "@/components/brand/panel";
import { Pill } from "@/components/brand/pill";
import { Sparkle } from "@/components/brand/sparkle";
import { Stat } from "@/components/brand/stat-grid";
import { accentFor } from "@/lib/site";
import { signOut } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Account · Dashboard" };

const DM_LABEL: Record<string, string> = {
  everyone: "Anyone can message you",
  followers: "Only people you follow",
  none: "Messages are off",
};

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
      className="group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors hover:bg-teal-50/60"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-100">
        <Icon size={18} />
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

  const admin = await getAdminContext();
  const accent = accentFor(profile.handle);
  const joined = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const dmLabel = DM_LABEL[profile.dm_privacy] ?? DM_LABEL.everyone;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          Account
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Your identity, settings, and how people reach you.
        </p>
      </div>

      {/* Identity — inline, no avatar/banner overlap. */}
      <Panel>
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
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-xs font-semibold text-gold-700"
                  title="Verified"
                >
                  <Sparkle size={13} color="var(--gold-500)" /> Verified
                </span>
              ) : (
                <Pill accent="neutral">Member</Pill>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.handle}</p>
          </div>
          <Link
            href="/dashboard/profile"
            className="btn btn-ghost btn-sm shrink-0"
          >
            <Pencil size={15} /> Edit profile
          </Link>
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-5">
          <Stat value={profile.follower_count} label="Followers" />
          <Stat value={joined} label="Joined" />
          <Stat
            value={profile.is_verified ? "Verified" : "Member"}
            label="Status"
          />
        </div>
      </Panel>

      {/* Privacy at-a-glance — links to where you change it. */}
      <Panel className="flex items-center gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sage-tint text-sage-deep">
          <ShieldCheck size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <PanelLabel>Who can message you</PanelLabel>
          <p className="mt-0.5 text-sm font-semibold text-ink">{dmLabel}</p>
        </div>
        <Link
          href="/settings/profile"
          className="shrink-0 text-sm font-semibold text-teal-800 hover:underline"
        >
          Change
        </Link>
      </Panel>

      {/* Manage */}
      <Panel className="p-2 sm:p-3">
        <PanelLabel className="px-3 pb-1 pt-2">Manage</PanelLabel>
        <div className="space-y-0.5">
          <ManageLink
            href="/dashboard/profile"
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

      {/* Admin — owner only, kept down by Sign out. */}
      {admin && (
        <Link
          href="/admin"
          className="group flex items-center gap-3.5 rounded-card border border-gold-200 bg-gold-50/60 p-4 transition-colors hover:bg-gold-50"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-100 text-gold-700">
            <ShieldCheck size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Admin tools</p>
            <p className="text-xs text-muted-foreground">
              Moderation queues — asks for your passcode.
            </p>
          </div>
          <ChevronRight
            size={16}
            className="shrink-0 text-gold-700/70 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}

      {/* Sign out */}
      <Panel className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Sign out</p>
          <p className="text-xs text-muted-foreground">
            End your session on this device.
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="btn btn-ghost btn-sm text-destructive hover:border-destructive/40"
          >
            <LogOut size={15} /> Sign out
          </button>
        </form>
      </Panel>
    </div>
  );
}
