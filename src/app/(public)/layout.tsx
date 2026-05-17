import Link from "next/link";
import { getTranslations } from "next-intl/server";
import PublicHeader from "@/components/PublicHeader";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("footer");
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">{children}</main>
      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{t("tagline")}</span>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="hover:text-foreground transition-colors">{t("docs")}</Link>
            <Link href="/freelancers" className="hover:text-foreground transition-colors">{t("builders")}</Link>
            <Link href="/showcase" className="hover:text-foreground transition-colors">{t("showcase")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
