"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function DirectorySearch({
  initialQ,
  initialTag,
}: {
  initialQ: string;
  initialTag: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [, startTransition] = useTransition();

  function pushSearch(value: string) {
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (initialTag) params.set("tag", initialTag);
    startTransition(() => {
      router.push(`/directory?${params.toString()}`);
    });
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="pl-8 h-9 text-sm"
          placeholder="Search by name, title, company..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            pushSearch(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
