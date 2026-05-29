import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/current-user";
import { EventForm } from "@/components/events/event-form";

export const metadata = { title: "Add an event" };

export default async function PostEventPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/events/post");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl text-ink">Add an event</h1>
      <p className="mt-2 text-muted-foreground">
        Share a workshop or meetup with the community.
      </p>
      <div className="mt-8 rounded-card border border-border bg-surface p-6 md:p-8">
        <EventForm />
      </div>
    </div>
  );
}
