import PublicHeader from "@/components/PublicHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
