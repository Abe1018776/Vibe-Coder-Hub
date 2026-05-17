"use client";

import { useLocale } from "next-intl";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export default function DirIcon({
  ltr: Ltr,
  rtl: Rtl,
  ...props
}: {
  ltr: ComponentType<LucideProps>;
  rtl: ComponentType<LucideProps>;
} & LucideProps) {
  const locale = useLocale();
  const Icon = locale === "he" ? Rtl : Ltr;
  return <Icon {...props} />;
}
