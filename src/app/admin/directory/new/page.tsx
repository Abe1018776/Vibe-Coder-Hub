import ProfessionalForm from "../_form";

export default function NewProfessionalPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-1">Add to Directory</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Adds a person to the public directory at /directory.
      </p>
      <ProfessionalForm />
    </div>
  );
}
