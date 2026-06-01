import type { Metadata, Viewport } from "next";
import { Comfortaa, Nunito_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import "./globals.css";

// Brand type: Comfortaa (rounded display) + Nunito Sans (body). JetBrains for tool chips.
const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});
const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_TAGLINE,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f6e66",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${comfortaa.variable} ${jetbrains.variable}`}
    >
      <body className="flex min-h-dvh flex-col overflow-x-clip bg-canvas pb-16 text-ink lg:pb-0">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
