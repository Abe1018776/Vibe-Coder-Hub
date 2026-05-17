"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { setLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/locale";

const OPTIONS: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "he", label: "עב" },
];

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("header");
  const [pending, startTransition] = useTransition();

  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        aria-label={t("language")}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-50"
      >
        <Languages size={14} />
        <span>{current.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.code}
            onSelect={() =>
              startTransition(() => {
                void setLocale(opt.code);
              })
            }
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <span>{opt.label}</span>
            {opt.code === locale && <Check size={12} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
