"use client";

import { useActionState } from "react";
import {
  createCompetition,
  type CompetitionFormState,
} from "@/lib/actions/competitions";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

function Field({
  label,
  children,
  required,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-clay-mid">*</span>}
        {hint && (
          <span className="ml-2 font-normal text-xs text-muted-foreground">
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-clay-deep">{error}</p>}
    </div>
  );
}

export function CompetitionForm() {
  const [state, action, pending] = useActionState<
    CompetitionFormState,
    FormData
  >(createCompetition, {});

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
          maxLength={120}
          dir="auto"
          className={inputClass}
          placeholder="Build the best ___"
        />
      </Field>

      <Field label="Brief" required error={state.fieldErrors?.description}>
        <textarea
          name="description"
          maxLength={4000}
          rows={5}
          dir="auto"
          className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
          placeholder="What should people build? How will you judge it?"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Prize ($)" required error={state.fieldErrors?.prize_amount}>
          <input
            name="prize_amount"
            type="number"
            min={1}
            className={inputClass}
            placeholder="500"
          />
        </Field>
        <Field label="Deadline" required error={state.fieldErrors?.deadline}>
          <input
            name="deadline"
            type="datetime-local"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Tags" hint="comma separated">
        <input
          name="tags"
          dir="auto"
          className={inputClass}
          placeholder="AI, Design, Open source"
        />
      </Field>

      <Field label="Loom / video URL" error={state.fieldErrors?.loom_url}>
        <input
          name="loom_url"
          type="url"
          className={inputClass}
          placeholder="https://loom.com/…"
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-gold btn-block h-12 text-[15px] disabled:opacity-70"
      >
        {pending ? "Posting…" : "Post competition"}
      </button>
    </form>
  );
}
