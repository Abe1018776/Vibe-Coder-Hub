import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/current-user";
import { Container, Eyebrow } from "@/components/brand/layout";
import { CompetitionForm } from "@/components/competitions/competition-form";

export const metadata = { title: "Post a competition" };

export default async function PostCompetitionPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/competitions/post");

  return (
    <Container className="max-w-2xl py-12 md:py-16">
      <div className="text-center">
        <Eyebrow style={{ color: "var(--gold-700)" }}>Run a challenge</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight text-ink">
          Post a competition
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[17px] text-muted-foreground">
          Put up a prize, set a deadline, and pick the winner when it ends.
        </p>
      </div>
      <div className="mt-9 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:p-8">
        <CompetitionForm />
      </div>
    </Container>
  );
}
