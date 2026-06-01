import { Container, Eyebrow } from "@/components/brand/layout";
import { EventRequestForm } from "@/components/events/event-request-form";

export const metadata = { title: "Request to post an event" };

export default function EventRequestPage() {
  return (
    <Container className="max-w-2xl py-12 md:py-16">
      <div className="text-center">
        <Eyebrow style={{ color: "var(--sage-deep)" }}>Bring people together</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight text-ink">
          Request to post an event
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[17px] text-muted-foreground">
          Tell us about your workshop or meetup. We review every request and post
          the good ones — you&apos;ll hear back by email.
        </p>
      </div>
      <div className="mt-9 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:p-8">
        <EventRequestForm />
      </div>
    </Container>
  );
}
