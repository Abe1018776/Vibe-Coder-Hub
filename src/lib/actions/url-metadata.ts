"use server";

/**
 * Fetch a project's live URL server-side and pull Open Graph / meta tags so the
 * submit form can auto-fill name, description, and cover image from a pasted link.
 * Runs on the server to dodge CORS; basic SSRF guards block private hosts.
 */

export type UrlMeta = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  error?: string;
};

const PRIVATE_HOST =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?)$/i;

export async function fetchUrlMetadata(raw: string): Promise<UrlMeta> {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { url: raw, error: "Paste a link first." };

  let target: URL;
  try {
    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    target = new URL(normalized);
  } catch {
    return { url: raw, error: "That doesn't look like a valid link." };
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return { url: raw, error: "Only http(s) links are supported." };
  }
  if (PRIVATE_HOST.test(target.hostname)) {
    return { url: target.toString(), error: "That link can't be fetched." };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(target.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "YidVibeBot/1.0 (+https://yidvibe.com)",
        accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timer);

    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.includes("text/html")) {
      // Reachable but not an HTML page — still hand back the normalized URL.
      return { url: target.toString() };
    }

    const html = (await res.text()).slice(0, 500_000);
    const metaTag = (prop: string) =>
      attr(
        match(
          html,
          new RegExp(
            `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>`,
            "i",
          ),
        ),
      );

    const title = clean(
      metaTag("og:title") ?? metaTag("twitter:title") ?? titleTag(html),
      120,
    );
    const description = clean(
      metaTag("og:description") ??
        metaTag("twitter:description") ??
        metaTag("description"),
      400,
    );
    let image = metaTag("og:image") ?? metaTag("twitter:image") ?? undefined;
    if (image) {
      try {
        image = new URL(image, target).toString();
      } catch {
        image = undefined;
      }
    }

    return { url: target.toString(), title, description, image };
  } catch {
    return { url: target.toString(), error: "Couldn't reach that link." };
  }
}

function match(html: string, re: RegExp): string | undefined {
  return html.match(re)?.[0];
}

function attr(tag?: string): string | undefined {
  if (!tag) return undefined;
  return tag.match(/content=["']([^"']*)["']/i)?.[1];
}

function titleTag(html: string): string | undefined {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
}

function clean(s: string | undefined, max: number): string | undefined {
  if (!s) return undefined;
  const t = s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return undefined;
  return t.length > max ? t.slice(0, max) : t;
}
