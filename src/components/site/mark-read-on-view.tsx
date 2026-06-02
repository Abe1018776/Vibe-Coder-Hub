"use client";

import { useEffect } from "react";
import { markAllNotificationsRead } from "@/lib/actions/notifications";

/** Marks all notifications read once when the notifications page mounts. */
export function MarkReadOnView({ hasUnread }: { hasUnread: boolean }) {
  useEffect(() => {
    if (hasUnread) void markAllNotificationsRead();
  }, [hasUnread]);
  return null;
}
