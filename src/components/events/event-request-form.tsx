"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { requestEvent, type EventRequestState } from "@/lib/actions/event-requests";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

export function EventRequestForm() {
  const [state, action, pending] = useActionState<EventRequestState, FormData>(
    requestEvent,
    {},
  );

  if (state.ok) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-sage-mid bg-sage-tint p-5 text-sage-deep">
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
        <p className="text-sm">
          Thanks! We got your event request — we&apos;ll be in touch via email.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-clay-tint px-3 py-2 text-sm text-clay-deep">
          {state.error}
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Event title
        </label>
        <input name="title" maxLength={200} dir="auto" className={inputClass} placeholder="e.g. Vibe-coding meetup" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Details
          <span className="ml-2 font-normal text-xs text-muted-foreground">
            what, when, where, who it&apos;s for
          </span>
        </label>
        <textarea
          name="details"
          rows={5}
          maxLength={4000}
          dir="auto"
          className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
          placeholder="Tell us about your workshop or meetup…"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Your contact
          <span className="ml-2 font-normal text-xs text-muted-foreground">
            email or phone so we can reach you
          </span>
        </label>
        <input name="contact" maxLength={200} className={inputClass} placeholder="you@email.com" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="btn-sweep inline-flex h-12 w-full items-center justify-center rounded-full px-4 text-[15px] font-semibold transition-transform active:scale-[0.99] disabled:opacity-70"
      >
        {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
