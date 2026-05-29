"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitEntry, type SubmissionState } from "@/lib/actions/competitions";
import { toast } from "sonner";

const inputClass =
  "h-10 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

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
    <form ref={ref} action={formAction} className="space-y-3">
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
        className="w-full resize-y rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        placeholder="Tell the judge about your entry (optional)"
      />
      {state.error && <p className="text-xs text-clay-deep">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-[10px] bg-clay-mid px-5 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-70"
      >
        {pending ? "Submitting…" : "Submit entry"}
      </button>
    </form>
  );
}
