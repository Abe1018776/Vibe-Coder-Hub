"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  createDirectoryListing,
  type DirectoryListingState,
} from "@/lib/actions/directory";
import { DIRECTORY_CATEGORIES } from "@/lib/site";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {hint && (
          <span className="ml-2 font-normal text-xs text-muted-foreground">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export function GetListedForm() {
  const [state, action, pending] = useActionState<
    DirectoryListingState,
    FormData
  >(createDirectoryListing, {});

  if (state.ok) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-sage-mid bg-sage-tint p-5 text-sage-deep">
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
        <p className="text-sm">
          Thanks! Your listing was submitted for review — we&apos;ll be in touch,
          and it&apos;ll appear in the directory once approved.
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name / business">
          <input name="name" maxLength={120} dir="auto" className={inputClass} placeholder="Your name or company" />
        </Field>
        <Field label="Category">
          <select name="category" defaultValue="" className={inputClass} aria-label="Category">
            <option value="" disabled>
              Choose one…
            </option>
            {DIRECTORY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="What you do">
        <textarea
          name="what_you_do"
          rows={3}
          maxLength={600}
          dir="auto"
          className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
          placeholder="A sentence or two about what you do."
        />
      </Field>

      <Field label="What you're looking for" hint="optional">
        <textarea
          name="wants"
          rows={2}
          maxLength={600}
          dir="auto"
          className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
          placeholder="Clients, collaborators, investment, work…"
        />
      </Field>

      <Field label="Contact" hint="at least one — how people reach you">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input name="contact_email" type="email" className={inputClass} placeholder="Email" />
          <input name="contact_phone" className={inputClass} placeholder="Phone" />
          <input name="contact_website" className={inputClass} placeholder="Website" />
        </div>
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="btn-sweep inline-flex h-12 w-full items-center justify-center rounded-full px-4 text-[15px] font-semibold transition-transform active:scale-[0.99] disabled:opacity-70"
      >
        {pending ? "Submitting…" : "Submit listing"}
      </button>
    </form>
  );
}
