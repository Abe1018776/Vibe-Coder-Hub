"use client";

import { useActionState, useState } from "react";
import { createEvent, type EventFormState } from "@/lib/actions/events";
import { CancelButton } from "@/components/brand/cancel-button";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { useScrollToFirstError } from "@/hooks/use-scroll-to-error";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

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
  const formRef = useScrollToFirstError(state.fieldErrors);

  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);

  return (
    <form
      ref={formRef}
      action={action}
      onChange={() => setDirty(true)}
      noValidate
      className="space-y-6"
    >
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
          className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
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

      <div className="flex items-center gap-3 pt-1">
        <CancelButton dirty={dirty} fallbackHref="/events" />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary h-12 flex-1 text-[15px] disabled:opacity-70"
        >
          {pending ? "Adding…" : "Add event"}
        </button>
      </div>
    </form>
  );
}
