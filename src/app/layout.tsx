import type { Metadata, Viewport } from "next";
import { Comfortaa, Nunito_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { ContextBar } from "@/components/site/context-bar";
import { FeedbackWidget } from "@/components/site/feedback-widget";
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
      <body className="flex min-h-dvh flex-col overflow-x-clip bg-canvas pb-16 text-ink lg:pb-0 lg:pl-64">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P4NLFG6W"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <SiteNav />
        <ContextBar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster richColors position="top-center" />
        <FeedbackWidget />
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-P4NLFG6W');`}
        </Script>
      </body>
    </html>
  );
}
