import { AuthForms } from "@/components/auth/auth-forms";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-4 py-16">
      <AuthForms next={next} initialMode="signin" />
    </div>
  );
}
