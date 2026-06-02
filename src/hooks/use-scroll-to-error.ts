"use client";

import { useEffect, useRef } from "react";

/**
 * After a failed server-action submit, scroll to and focus the first field that
 * has an error. Pass the action state's `fieldErrors`; attach the returned ref
 * to the `<form>`. Re-runs on every submit because `useActionState` returns a
 * fresh state object each time, so the user is always nudged to the first issue.
 */
export function useScrollToFirstError(
  fieldErrors: Record<string, string> | undefined,
) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!fieldErrors || Object.keys(fieldErrors).length === 0) return;
    const form = formRef.current;
    if (!form) return;

    // Walk fields in DOM order so we land on the first visible problem.
    for (const el of Array.from(form.elements)) {
      const named = el as HTMLInputElement;
      if (named.name && fieldErrors[named.name]) {
        named.scrollIntoView({ behavior: "smooth", block: "center" });
        // preventScroll: the smooth scroll above owns the motion.
        named.focus?.({ preventScroll: true });
        break;
      }
    }
  }, [fieldErrors]);

  return formRef;
}
