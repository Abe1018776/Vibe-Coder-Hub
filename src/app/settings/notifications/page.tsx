import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bell } from "lucide-react";
import { getCurrentProfile } from "@/lib/current-user";
import { updateNotificationPrefs } from "@/lib/actions/notifications";
import { NOTIFICATION_TYPES } from "@/lib/site";
import { Panel, PanelLabel } from "@/components/brand/panel";

export const metadata = { title: "Notification settings" };

export default async function NotificationSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/settings/notifications");

  const prefs = (profile.notification_prefs ?? {}) as Record<string, boolean>;

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-6 md:py-12">
      <Link
        href="/dashboard/account"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-teal-800"
      >
        <ArrowLeft size={16} /> Back to account
      </Link>

      <div className="mt-5 flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <Bell size={22} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose what you want to be notified about. Everything is on by
            default.
          </p>
        </div>
      </div>

      <form action={updateNotificationPrefs} className="mt-7 space-y-5">
        <Panel className="p-2 sm:p-3">
          <PanelLabel className="px-3 pb-1 pt-2">Email & in-app</PanelLabel>
          <div className="divide-y divide-border/70">
            {NOTIFICATION_TYPES.map((t) => (
              <label
                key={t.key}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-teal-50/40"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    {t.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {t.description}
                  </span>
                </span>
                <input
                  type="checkbox"
                  name={t.key}
                  defaultChecked={prefs[t.key] !== false}
                  className="peer sr-only"
                />
                <span className="relative h-6 w-11 shrink-0 rounded-full bg-border transition-colors peer-checked:bg-teal-600 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-600/30 peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
              </label>
            ))}
          </div>
        </Panel>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary">
            Save settings
          </button>
          <Link href="/dashboard/account" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
