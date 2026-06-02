import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// Non-admins never get here — requireAdmin() returns notFound().
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />
      <main className="max-w-5xl flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
