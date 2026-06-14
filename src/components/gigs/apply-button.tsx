"use client";

import { useFormStatus } from "react-dom";

export function ApplyButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-orange disabled:opacity-70"
    >
      {pending ? "Applying…" : "Apply to this gig"}
    </button>
  );
}
