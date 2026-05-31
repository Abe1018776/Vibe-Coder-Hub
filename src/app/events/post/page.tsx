import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/current-user";
import { Container, Eyebrow } from "@/components/brand/layout";
import { EventForm } from "@/components/events/event-form";

export const metadata = { title: "Add an event" };

export default async function PostEventPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/events/post");

  return (
    <Container className="max-w-2xl py-12 md:py-16">
      <div className="text-center">
        <Eyebrow style={{ color: "var(--sage-deep)" }}>Bring people together</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight text-ink">
          Add an event
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[17px] text-muted-foreground">
          Share a workshop or meetup with the community.
        </p>
      </div>
      <div className="mt-9 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:p-8">
        <EventForm />
      </div>
    </Container>
  );
}
