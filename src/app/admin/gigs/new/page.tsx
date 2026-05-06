import CreateGigClient from "./_client";

export default function CreateGigPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-1">Post a gig</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Generates a public link freelancers can apply through.
      </p>
      <CreateGigClient />
    </div>
  );
}
