import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/current-user";
import { CompetitionForm } from "@/components/competitions/competition-form";

export const metadata = { title: "Post a competition" };

export default async function PostCompetitionPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/competitions/post");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl text-ink">Post a competition</h1>
      <p className="mt-2 text-muted-foreground">
        Put up a prize, set a deadline, and pick the winner when it ends.
      </p>
      <div className="mt-8 rounded-card border border-border bg-surface p-6 md:p-8">
        <CompetitionForm />
      </div>
    </div>
  );
}
