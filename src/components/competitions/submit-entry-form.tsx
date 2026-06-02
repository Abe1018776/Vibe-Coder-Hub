"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitEntry, type SubmissionState } from "@/lib/actions/competitions";
import { toast } from "sonner";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

export function SubmitEntryForm({
  competitionId,
  slug,
}: {
  competitionId: string;
  slug: string;
}) {
  const action = submitEntry.bind(null, competitionId, slug);
  const [state, formAction, pending] = useActionState<
    SubmissionState,
    FormData
  >(action, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      toast.success("Entry submitted!");
    }
  }, [state]);

  return (
    <form ref={ref} action={formAction} noValidate className="space-y-3">
      <input
        name="submission_url"
        type="url"
        required
        className={inputClass}
        placeholder="Link to your entry (https://…)"
      />
      <input
        name="loom_url"
        type="url"
        className={inputClass}
        placeholder="Demo / Loom URL (optional)"
      />
      <textarea
        name="description"
        rows={3}
        dir="auto"
        maxLength={1000}
        className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
        placeholder="Tell the judge about your entry (optional)"
      />
      {state.error && <p className="text-xs text-clay-deep">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-gold btn-sm disabled:opacity-70"
      >
        {pending ? "Submitting…" : "Submit entry"}
      </button>
    </form>
  );
}
