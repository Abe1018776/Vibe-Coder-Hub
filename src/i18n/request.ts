import { getRequestConfig } from "next-intl/server";
import { resolveLocale, DEFAULT_LOCALE } from "@/lib/i18n/locale";

export default getRequestConfig(async () => {
  const locale = await resolveLocale();

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const fallback =
    locale === DEFAULT_LOCALE
      ? messages
      : (await import(`../../messages/${DEFAULT_LOCALE}.json`)).default;

  return {
    locale,
    messages,
    onError(error: { code: string; message?: string }) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] ${error.code}: ${error.message ?? ""}`);
      }
    },
    getMessageFallback({ key, namespace }: { key: string; namespace?: string }) {
      const path = namespace ? `${namespace}.${key}` : key;
      const value = path
        .split(".")
        .reduce<unknown>(
          (acc, seg) =>
            acc && typeof acc === "object" && seg in (acc as Record<string, unknown>)
              ? (acc as Record<string, unknown>)[seg]
              : undefined,
          fallback,
        );
      return typeof value === "string" ? value : path;
    },
  };
});
