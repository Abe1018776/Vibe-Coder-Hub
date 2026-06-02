"use client";

import { useActionState, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { inviteUser } from "@/lib/actions/admin";

export function InviteUser() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(inviteUser, {});

  useEffect(() => {
    if (state.ok) {
      toast.success("Invite sent.");
      setOpen(false);
    }
  }, [state.ok]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="btn btn-primary btn-sm">
          <UserPlus size={15} /> Invite user
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-card">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-ink">
            Invite a user
          </DialogTitle>
          <DialogDescription>
            We&rsquo;ll email them a link to set up their account.
          </DialogDescription>
        </DialogHeader>

        <form action={action} noValidate className="space-y-3">
          {state.error && (
            <div className="rounded-lg bg-clay-tint px-3 py-2 text-sm text-clay-deep">
              {state.error}
            </div>
          )}
          <input
            type="email"
            name="email"
            autoComplete="off"
            placeholder="name@example.com"
            className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
          />
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary btn-block"
          >
            {pending ? "Sending…" : "Send invite"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
