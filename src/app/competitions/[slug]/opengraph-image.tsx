import { getCompetitionBySlug } from "@/lib/competitions";
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A competition on YidVibe";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comp = await getCompetitionBySlug(slug).catch(() => null);
  return ogImage({
    title: comp?.title ?? "YidVibe",
    description: comp?.description?.slice(0, 110),
    kind: "Competition",
  });
}
