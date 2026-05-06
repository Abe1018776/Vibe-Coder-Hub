import CreateFreelancerClient from "./_client";

export default function CreateFreelancerPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Add freelancer</h1>
      <CreateFreelancerClient />
    </div>
  );
}
