import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { updateNotificationPrefs } from "@/lib/actions/notifications";
import { NOTIFICATION_TYPES } from "@/lib/site";

export const metadata = { title: "Notification settings" };

export default async function NotificationSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/settings/notifications");

  const prefs = (profile.notification_prefs ?? {}) as Record<string, boolean>;

  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:px-6">
      <h1 className="font-display text-2xl text-ink">Notification settings</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Choose what you want to be notified about. Everything is on by default.
      </p>

      <form action={updateNotificationPrefs} className="mt-6 space-y-2">
        {NOTIFICATION_TYPES.map((t) => (
          <label
            key={t.key}
            className="flex cursor-pointer items-center justify-between gap-4 rounded-card border border-border bg-surface px-4 py-3"
          >
            <span>
              <span className="block text-sm font-medium text-ink">
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
            <span className="relative h-6 w-11 shrink-0 rounded-full bg-border transition-colors peer-checked:bg-teal-600 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        ))}

        <button
          type="submit"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-[10px] bg-teal-600 px-5 text-[15px] font-medium text-white transition-transform active:scale-[0.99]"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}
