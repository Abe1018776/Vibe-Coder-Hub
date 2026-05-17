import Link from "next/link";
import { getTranslations } from "next-intl/server";
import PublicHeader from "@/components/PublicHeader";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-6xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-xl font-bold mb-2">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t("subtitle")}
        </p>
        <Link href="/">
          <span className="text-sm text-primary underline cursor-pointer">
            {t("backHome")}
          </span>
        </Link>
      </div>
    </div>
  );
}
