"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Subtle 3-dot overflow menu. Deliberately low-key — used to tuck away secondary
 * actions like "Report" so they're available everywhere without crowding the UI.
 * Pass <KebabItem>s (or any DropdownMenu.Item children) as children.
 */
export function KebabMenu({
  children,
  label = "More options",
  align = "end",
  className,
}: {
  children: React.ReactNode;
  label?: string;
  align?: "start" | "center" | "end";
  className?: string;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={label}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/70 outline-none transition-colors hover:bg-secondary hover:text-ink focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <MoreHorizontal size={16} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-44 rounded-xl border border-border bg-surface p-1.5 shadow-float"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** A single clickable row inside a KebabMenu. */
export function KebabItem({
  onSelect,
  children,
  destructive,
}: {
  onSelect?: () => void;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <DropdownMenu.Item
      onSelect={(e) => {
        e.preventDefault();
        onSelect?.();
      }}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors hover:bg-secondary focus:bg-secondary",
        destructive ? "text-clay-deep" : "text-ink",
      )}
    >
      {children}
    </DropdownMenu.Item>
  );
}
