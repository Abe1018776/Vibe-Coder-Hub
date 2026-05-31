import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/current-user";
import { Container, Eyebrow } from "@/components/brand/layout";
import { GigForm } from "@/components/gigs/gig-form";

export const metadata = { title: "Post a gig" };

export default async function PostGigPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/gigs/post");

  return (
    <Container className="max-w-2xl py-12 md:py-16">
      <div className="text-center">
        <Eyebrow style={{ color: "var(--orange-deep)" }}>Hire a builder</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight text-ink">
          Post a gig
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[17px] text-muted-foreground">
          Describe the work. Applicants message you in a private thread.
        </p>
      </div>
      <div className="mt-9 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:p-8">
        <GigForm />
      </div>
    </Container>
  );
}
