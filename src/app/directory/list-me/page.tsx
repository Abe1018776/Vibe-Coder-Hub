import { redirect } from "next/navigation";
import { Container } from "@/components/brand/layout";
import { PageHeader } from "@/components/brand/page-header";
import { getCurrentProfile } from "@/lib/current-user";
import { getMyDirectoryListing } from "@/lib/queries";
import { DIRECTORY_CATEGORIES } from "@/lib/site";
import { SelfListingForm } from "@/components/directory/self-listing-form";
import { FormHelpLink } from "@/components/brand/form-help-link";

export const metadata = { title: "Get listed in the Directory" };

export default async function ListMePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/directory/list-me");
  const existing = await getMyDirectoryListing();
  if (existing) redirect("/directory");

  const links = (profile.links ?? {}) as Record<string, string | undefined>;
  return (
    <Container className="max-w-2xl py-8 md:py-10">
      <PageHeader
        accent="blue"
        eyebrow="Connect"
        title="Add me to the Directory"
        subtitle="We pulled in what we already know from your profile — just fill the gaps."
      />
      <div className="mt-3">
        <FormHelpLink>See how the directory works →</FormHelpLink>
      </div>
      <div className="mt-6">
        <SelfListingForm
          categories={DIRECTORY_CATEGORIES}
          defaults={{
            name: profile.name,
            what_you_do: profile.bio ?? "",
            email: links.email ?? "",
            phone: links.phone ?? "",
            website: links.website ?? "",
            logo_url: profile.avatar_url ?? "",
          }}
        />
      </div>
    </Container>
  );
}
