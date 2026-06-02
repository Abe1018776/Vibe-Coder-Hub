"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  createMyDirectoryListing,
  type DirectoryListingState,
} from "@/lib/actions/directory";
import { useActionState } from "react";
import { useScrollToFirstError } from "@/hooks/use-scroll-to-error";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

/** Subtle "from profile" affordance shown next to prefilled labels. */
function FromProfile() {
  return (
    <span
      className="ml-2 inline-flex items-center gap-1 align-middle text-[11px] font-normal"
      style={{ color: "var(--sage-deep)" }}
    >
      <Check size={12} /> from profile
    </span>
  );
}

function Field({
  label,
  hint,
  fromProfile,
  error,
  children,
}: {
  label: string;
  hint?: string;
  fromProfile?: boolean;
  error?: string;
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
        {fromProfile && <FromProfile />}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-clay-deep">{error}</p>}
    </div>
  );
}

export function SelfListingForm({
  defaults,
  categories,
}: {
  defaults: {
    name: string;
    what_you_do: string;
    email: string;
    phone: string;
    website: string;
    logo_url: string;
  };
  categories: string[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<
    DirectoryListingState,
    FormData
  >(createMyDirectoryListing, {});
  const formRef = useScrollToFirstError(state.fieldErrors);
  const [goPublic, setGoPublic] = useState(true);

  useEffect(() => {
    if (state.ok) router.push("/directory");
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={action} noValidate className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-clay-tint px-3 py-2 text-sm text-clay-deep">
          {state.error}
        </div>
      )}

      <input type="hidden" name="logo_url" value={defaults.logo_url} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Name / business"
          fromProfile={!!defaults.name}
          error={state.fieldErrors?.name}
        >
          <input
            name="name"
            defaultValue={defaults.name}
            maxLength={120}
            dir="auto"
            className={inputClass}
            placeholder="Your name or company"
          />
        </Field>
        <Field label="Category" error={state.fieldErrors?.category}>
          <select
            name="category"
            defaultValue=""
            className={inputClass}
            aria-label="Category"
          >
            <option value="" disabled>
              Choose one…
            </option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="What you do"
        fromProfile={!!defaults.what_you_do}
        error={state.fieldErrors?.what_you_do}
      >
        <textarea
          name="what_you_do"
          defaultValue={defaults.what_you_do}
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
          placeholder="Clients, collaborators, work…"
        />
      </Field>

      <Field
        label="Contact"
        hint="at least one — how people reach you"
        fromProfile={!!(defaults.email || defaults.phone || defaults.website)}
        error={state.fieldErrors?.contact_email}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            name="contact_email"
            type="email"
            defaultValue={defaults.email}
            className={inputClass}
            placeholder="Email"
          />
          <input
            name="contact_phone"
            defaultValue={defaults.phone}
            className={inputClass}
            placeholder="Phone"
          />
          <input
            name="contact_website"
            defaultValue={defaults.website}
            className={inputClass}
            placeholder="Website"
          />
        </div>
      </Field>

      {/* Go-public toggle — last control before submit. */}
      <input type="hidden" name="go_public" value={goPublic ? "on" : ""} />
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-secondary/40 p-4">
        <input
          type="checkbox"
          checked={goPublic}
          onChange={(e) => setGoPublic(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-teal-600"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">
            Make my profile public too
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            So people who find you in the directory can open your full profile.
            You can turn this off anytime in settings.
          </span>
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="btn-sweep inline-flex h-12 w-full items-center justify-center rounded-full px-4 text-[15px] font-semibold transition-transform active:scale-[0.99] disabled:opacity-70"
      >
        {pending ? "Adding…" : "Add me to the Directory"}
      </button>
    </form>
  );
}
