import { AuthForms } from "@/components/auth/auth-forms";

export const metadata = { title: "Create account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-4 py-16">
      <AuthForms next={next} initialMode="signup" />
    </div>
  );
}
