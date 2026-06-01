import { getProjectById } from "@/lib/queries";
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A project on YidVibe";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id).catch(() => null);
  return ogImage({
    title: project?.name ?? "YidVibe",
    description: project?.description?.slice(0, 110),
    image: project?.image_url,
    kind: "Project",
  });
}
