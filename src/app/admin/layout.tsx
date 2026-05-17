import Sidebar from "@/components/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="ltr">
      <Sidebar>{children}</Sidebar>
    </div>
  );
}
