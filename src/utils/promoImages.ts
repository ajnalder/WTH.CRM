const IMAGE_PROXY_HOSTS = new Set(["cdn.shopify.com"]);

const htmlEntityMap: Record<string, string> = {
  "&amp;": "&",
  "&quot;": "\"",
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

function decodeHtmlEntities(value: string) {
  return value.replace(/&(?:amp|quot|#39|lt|gt);/g, (match) => htmlEntityMap[match] || match);
}

export function normalizeImageUrl(url?: string | null) {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed) return "";
  trimmed = decodeHtmlEntities(trimmed);
  if (trimmed.startsWith("//")) {
    trimmed = `https:${trimmed}`;
  } else if (trimmed.startsWith("http://")) {
    trimmed = `https://${trimmed.slice("http://".length)}`;
  }
  return encodeURI(trimmed);
}

export function isProxyableImageUrl(url: string) {
  try {
    const parsed = new URL(url);
    return IMAGE_PROXY_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function getConvexSiteOrigin() {
  const raw =
    import.meta.env.VITE_CONVEX_SITE_URL || import.meta.env.VITE_CONVEX_URL || "";
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.hostname.endsWith(".convex.cloud")) {
      url.hostname = url.hostname.replace(/\.convex\.cloud$/, ".convex.site");
    }
    return url.origin;
  } catch {
    return "";
  }
}

export function buildImageProxyUrl(normalizedUrl: string) {
  if (!normalizedUrl) return "";
  if (!isProxyableImageUrl(normalizedUrl)) return "";
  const origin = getConvexSiteOrigin();
  if (!origin) return "";
  const proxyUrl = new URL("/image-proxy", origin);
  proxyUrl.searchParams.set("url", normalizedUrl);
  return proxyUrl.toString();
}
