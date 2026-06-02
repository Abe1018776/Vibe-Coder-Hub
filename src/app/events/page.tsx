import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { listAllEvents } from "@/lib/events";
import { Container, Eyebrow } from "@/components/brand/layout";
import { EmptyState } from "@/components/brand/empty-state";
import { EventsBoard } from "@/components/events/events-board";

export const metadata = {
  title: "Events",
  description: "Community workshops and meetups for builders.",
};

export default async function EventsPage() {
  const events = await listAllEvents();

  return (
    <Container className="max-w-4xl py-10 md:py-14">
      <div>
        <Eyebrow style={{ color: "var(--sage-deep)" }}>Meet in person</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.25rem)] font-bold tracking-tight text-ink">
          Events
        </h1>
        <p className="mt-2 text-[17px] text-muted-foreground">
          Browse community workshops and meetups by date, place, or keyword.
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<CalendarDays size={22} />}
          title="No events yet"
          description="Hosting a workshop or meetup? Add it so the community can join."
          actionHref="/events/request"
          actionLabel="Request an event"
        />
      ) : (
        <EventsBoard events={events} />
      )}

      <div className="mt-10 rounded-2xl border border-border bg-surface p-5 text-center">
        <p className="text-sm text-muted-foreground">
          Hosting a workshop or meetup?
        </p>
        <Link href="/events/request" className="btn btn-primary btn-sm mt-3">
          Request to post an event
        </Link>
      </div>
    </Container>
  );
}
