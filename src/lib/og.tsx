import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** Shared branded Open Graph card for project / gig / competition share links. */
export function ogImage({
  title,
  description,
  image,
  kind,
}: {
  title: string;
  description?: string;
  image?: string | null;
  kind?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          color: "white",
          backgroundImage: "linear-gradient(135deg, #2f8079 0%, #16504a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#E0A12E",
              }}
            />
            YidVibe
          </div>
          {kind ? (
            <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.85 }}>
              {kind}
            </div>
          ) : null}
        </div>

        {image ? (
          <div
            style={{
              display: "flex",
              flex: 1,
              margin: "28px 0",
              borderRadius: 24,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              width={1072}
              height={360}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.1 }}>
            {title}
          </div>
          {description ? (
            <div style={{ fontSize: 28, lineHeight: 1.3, opacity: 0.85 }}>
              {description}
            </div>
          ) : null}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
