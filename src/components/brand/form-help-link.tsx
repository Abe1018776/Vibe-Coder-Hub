import Link from "next/link";
import { HelpCircle } from "lucide-react";

/** Clean, non-gatekeepy help link under a post form. */
export function FormHelpLink({ children, href = "/docs" }: { children: React.ReactNode; href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:underline">
      <HelpCircle size={15} /> {children}
    </Link>
  );
}
