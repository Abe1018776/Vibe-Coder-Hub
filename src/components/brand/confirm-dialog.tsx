"use client";

import * as Dialog from "@radix-ui/react-dialog";

/**
 * Branded confirm dialog. Controlled via `open` / `onOpenChange`. Calls
 * `onConfirm` when the primary (destructive) action is pressed.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-float focus:outline-none">
          <Dialog.Title className="font-display text-lg font-bold text-ink">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close className="btn btn-ghost btn-sm">{cancelLabel}</Dialog.Close>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onConfirm();
              }}
              className="btn btn-sm bg-clay-mid text-white hover:bg-clay-deep"
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
