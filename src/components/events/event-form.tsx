"use client";

import { useActionState } from "react";
import { createEvent, type EventFormState } from "@/lib/actions/events";

const inputClass =
  "h-10 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

function Field({
  label,
  children,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-clay-mid">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-clay-deep">{error}</p>}
    </div>
  );
}

export function EventForm() {
  const [state, action, pending] = useActionState<EventFormState, FormData>(
    createEvent,
    {},
  );

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <div className="rounded-lg bg-clay-tint px-3 py-2 text-sm text-clay-deep">
          {state.error}
        </div>
      )}

      <Field label="Title" required error={state.fieldErrors?.title}>
        <input
          name="title"
          maxLength={140}
          dir="auto"
          className={inputClass}
          placeholder="Vibe coders meetup"
        />
      </Field>

      <Field label="Date & time" required error={state.fieldErrors?.starts_at}>
        <input name="starts_at" type="datetime-local" className={inputClass} />
      </Field>

      <Field label="Location" error={state.fieldErrors?.location}>
        <input
          name="location"
          maxLength={140}
          dir="auto"
          className={inputClass}
          placeholder="Brooklyn, NY — or Online"
        />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          maxLength={2000}
          rows={4}
          dir="auto"
          className="w-full resize-y rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          placeholder="What's happening?"
        />
      </Field>

      <Field label="Link (RSVP / details)" error={state.fieldErrors?.url}>
        <input
          name="url"
          type="url"
          className={inputClass}
          placeholder="https://lu.ma/…"
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-sage-mid px-4 text-[15px] font-medium text-white transition-transform active:scale-[0.99] disabled:opacity-70"
      >
        {pending ? "Adding…" : "Add event"}
      </button>
    </form>
  );
}
