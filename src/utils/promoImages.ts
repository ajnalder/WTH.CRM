export function normalizeImageUrl(url?: string | null) {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) {
    return encodeURI(`https:${trimmed}`);
  }
  if (trimmed.startsWith("http://")) {
    return encodeURI(`https://${trimmed.slice("http://".length)}`);
  }
  if (trimmed.startsWith("https://")) {
    return encodeURI(trimmed);
  }
  return encodeURI(trimmed);
}
