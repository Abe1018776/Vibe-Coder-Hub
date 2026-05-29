import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/current-user";
import { GigForm } from "@/components/gigs/gig-form";

export const metadata = { title: "Post a gig" };

export default async function PostGigPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/gigs/post");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl text-ink">Post a gig</h1>
      <p className="mt-2 text-muted-foreground">
        Describe the work. Applicants message you in a private thread.
      </p>
      <div className="mt-8 rounded-card border border-border bg-surface p-6 md:p-8">
        <GigForm />
      </div>
    </div>
  );
}
