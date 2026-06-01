import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { Panel } from "@/components/brand/panel";

export const metadata: Metadata = { title: "Inbox · Dashboard" };

export default function DashboardInbox() {
  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        Inbox
      </h1>
      <Panel className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-teal-700">
          <MessageCircle size={22} />
        </span>
        <p className="text-sm text-muted-foreground">
          No messages yet. Private notes from other builders will appear here.
        </p>
      </Panel>
    </div>
  );
}
