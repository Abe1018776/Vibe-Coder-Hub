import NewCompetitionClient from "./_client";

export default function NewCompetitionPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-1">Post a competition</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Generates a public link anyone can use to submit entries.
      </p>
      <NewCompetitionClient />
    </div>
  );
}
