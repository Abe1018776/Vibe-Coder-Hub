"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { KebabMenu, KebabItem } from "@/components/brand/kebab-menu";
import { createReport } from "@/lib/actions/reports";

const REASONS: [string, string][] = [
  ["spam", "Spam"],
  ["inappropriate", "Inappropriate"],
  ["scam", "Scam or fraud"],
  ["offensive", "Offensive"],
  ["copyright", "Copyright / stolen"],
  ["other", "Something else"],
];

/** Hidden 3-dot menu → opens a Report dialog. Reusable across any content type. */
export function ReportMenu({
  targetType,
  targetId,
  className,
}: {
  targetType: "project" | "comment" | "profile" | "gig" | "competition" | "event";
  targetId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <KebabMenu className={className}>
        <KebabItem destructive onSelect={() => setOpen(true)}>
          <Flag size={15} /> Report
        </KebabItem>
      </KebabMenu>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[1px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-surface p-5 shadow-float">
            <Dialog.Title className="font-display text-lg text-ink">
              Report this
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Tell us what&apos;s wrong — an admin reviews every report.
            </Dialog.Description>

            <div className="mt-4 space-y-2">
              {REASONS.map(([val, label]) => (
                <label
                  key={val}
                  className="flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={val}
                    checked={reason === val}
                    onChange={() => setReason(val)}
                    className="accent-teal-600"
                  />
                  {label}
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Anything else? (optional)"
              className="mt-3 w-full resize-y rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />

            <div className="mt-4 flex justify-end gap-2">
              <Dialog.Close className="inline-flex h-9 items-center rounded-[10px] border border-border bg-surface px-4 text-sm text-ink transition-colors hover:bg-secondary">
                Cancel
              </Dialog.Close>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await createReport(
                      targetType,
                      targetId,
                      reason,
                      details,
                    );
                    if (res.error) {
                      toast.error(res.error);
                      return;
                    }
                    toast.success("Thanks — your report was sent.");
                    setOpen(false);
                    setDetails("");
                  })
                }
                className="inline-flex h-9 items-center rounded-[10px] bg-clay-mid px-4 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-70"
              >
                {pending ? "Sending…" : "Send report"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
