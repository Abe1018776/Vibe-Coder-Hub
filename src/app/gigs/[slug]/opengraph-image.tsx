import { getGigBySlug } from "@/lib/gigs";
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A gig on YidVibe";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gig = await getGigBySlug(slug).catch(() => null);
  return ogImage({
    title: gig?.title ?? "YidVibe",
    description: gig?.description?.slice(0, 110),
    kind: "Gig",
  });
}
