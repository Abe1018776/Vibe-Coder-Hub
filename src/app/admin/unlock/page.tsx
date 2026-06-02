import { ShieldCheck } from "lucide-react";
import { requireAdmin, isAdminUnlocked, passcodeConfigured } from "@/lib/admin";
import { redirect } from "next/navigation";
import { AdminUnlockForm } from "@/components/admin/admin-unlock-form";

export default async function AdminUnlockPage() {
  const ctx = await requireAdmin();
  if (await isAdminUnlocked(ctx.userId)) redirect("/admin");

  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="rounded-card border border-border bg-surface p-7 text-center">
        <ShieldCheck size={28} className="mx-auto text-teal-600" />
        <h1 className="mt-3 font-display text-xl text-ink">Admin re-authentication</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter the admin passcode to unlock the moderation tools for this session.
        </p>
        {!passcodeConfigured() && (
          <p className="mt-4 rounded-lg bg-clay-tint px-3 py-2 text-sm text-clay-deep">
            No <code>ADMIN_PASSCODE</code> is set on the server yet.
          </p>
        )}
        <AdminUnlockForm />
      </div>
    </div>
  );
}
