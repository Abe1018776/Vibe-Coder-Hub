import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { enUS, heIL } from "@clerk/localizations";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { resolveLocale, isRtl } from "@/lib/i18n/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe Coder Hub",
  description: "Marketplace for AI-native builders",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await resolveLocale();
  const messages = await getMessages();
  const rtl = isRtl(locale);

  return (
    <ClerkProvider localization={locale === "he" ? heIL : enUS}>
      <html lang={locale} dir={rtl ? "rtl" : "ltr"}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Hebrew:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ReactQueryProvider>{children}</ReactQueryProvider>
            <Toaster richColors position="top-right" />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
