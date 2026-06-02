"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resolveReport, type ReportAction } from "@/lib/actions/admin";

const CAN_HIDE = new Set(["project", "comment"]);

export function AdminReportActions({
  reportId,
  targetType,
}: {
  reportId: string;
  targetType: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (action: ReportAction, label: string) =>
    startTransition(async () => {
      await resolveReport(reportId, action);
      toast.success(label);
      router.refresh();
    });

  return (
    <div className="flex flex-wrap gap-2">
      {CAN_HIDE.has(targetType) && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run("hide", "Content hidden")}
          className="inline-flex h-8 items-center rounded-[10px] border border-border bg-surface px-3 text-xs font-medium text-ink hover:bg-secondary disabled:opacity-60"
        >
          Hide
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => run("delete", "Content deleted")}
        className="inline-flex h-8 items-center rounded-[10px] bg-clay-mid px-3 text-xs font-medium text-white hover:bg-clay-deep disabled:opacity-60"
      >
        Delete
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run("dismiss", "Report dismissed")}
        className="inline-flex h-8 items-center rounded-[10px] border border-border bg-surface px-3 text-xs font-medium text-muted-foreground hover:bg-secondary disabled:opacity-60"
      >
        Dismiss
      </button>
    </div>
  );
}
