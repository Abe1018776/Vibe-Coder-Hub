"use client";

import { useActionState, useState } from "react";
import { createGig, type GigFormState } from "@/lib/actions/gigs";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

const TYPES = [
  { value: "task", label: "Task", hint: "One-off, fixed scope" },
  { value: "build", label: "Build", hint: "A full project" },
  { value: "hourly", label: "Hourly", hint: "Ongoing, by the hour" },
] as const;

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

export function GigForm() {
  const [state, action, pending] = useActionState<GigFormState, FormData>(
    createGig,
    {},
  );
  const [type, setType] = useState<"task" | "build" | "hourly">("task");

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <div className="rounded-lg bg-clay-tint px-3 py-2 text-sm text-clay-deep">
          {state.error}
        </div>
      )}

      <Field label="Type" required>
        <input type="hidden" name="type" value={type} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TYPES.map((t) => {
            const active = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={cn(
                  "rounded-card border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-orange-mid bg-orange-tint"
                    : "border-border bg-surface hover:border-border-hover",
                )}
              >
                <span
                  className={cn(
                    "block text-sm font-medium",
                    active ? "text-orange-deep" : "text-ink",
                  )}
                >
                  {t.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t.hint}
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Title" required error={state.fieldErrors?.title}>
        <input
          name="title"
          maxLength={120}
          dir="auto"
          className={inputClass}
          placeholder="What do you need built?"
        />
      </Field>

      <Field label="Description" required error={state.fieldErrors?.description}>
        <textarea
          name="description"
          maxLength={4000}
          rows={5}
          dir="auto"
          className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
          placeholder="Describe the work, scope, and what 'done' looks like."
        />
      </Field>

      {type === "hourly" ? (
        <Field label="Hourly rate ($)">
          <input
            name="hourly_rate"
            type="number"
            min={0}
            className={cn(inputClass, "max-w-xs")}
            placeholder="50"
          />
        </Field>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Budget min ($)">
            <input name="budget_min" type="number" min={0} className={inputClass} placeholder="500" />
          </Field>
          <Field label="Budget max ($)">
            <input name="budget_max" type="number" min={0} className={inputClass} placeholder="2000" />
          </Field>
        </div>
      )}

      <Field label="Tags" hint="comma separated">
        <input
          name="tags"
          dir="auto"
          className={inputClass}
          placeholder="Automation, Next.js, Design"
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
        className="btn btn-orange btn-block h-12 text-[15px] disabled:opacity-70"
      >
        {pending ? "Posting…" : "Post gig"}
      </button>
    </form>
  );
}
