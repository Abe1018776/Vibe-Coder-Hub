"use client";

import { useEffect } from "react";

/**
 * Warns before the tab is closed / hard-navigated away while a form has unsaved
 * changes. In-app router navigation (the Cancel button) is guarded separately by
 * `CancelButton`'s confirm dialog.
 */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
