import { cookies, headers } from "next/headers";

export type Locale = "en" | "he";
export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "he"] as const;
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export async function resolveLocale(): Promise<Locale> {
  const cookieVal = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (cookieVal === "he" || cookieVal === "en") return cookieVal;

  const accept = (await headers()).get("accept-language") ?? "";
  if (/(^|[,;\s])he(\b|-)/i.test(accept)) return "he";
  return DEFAULT_LOCALE;
}

export function isRtl(locale: Locale): boolean {
  return locale === "he";
}
