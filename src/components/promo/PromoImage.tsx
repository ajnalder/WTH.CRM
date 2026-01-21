import { type ImgHTMLAttributes, type ReactNode, useEffect, useMemo, useState } from "react";
import { buildImageProxyUrl, normalizeImageUrl } from "@/utils/promoImages";
import { isIOS } from "@/utils/mobileDetection";

type PromoImageProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  fallback?: ReactNode;
};

export function PromoImage({
  src,
  alt = "",
  className,
  loading = "lazy",
  decoding = "async",
  referrerPolicy = "no-referrer",
  fallback = null,
}: PromoImageProps) {
  const normalized = useMemo(() => normalizeImageUrl(src), [src]);
  const proxyUrl = useMemo(() => buildImageProxyUrl(normalized), [normalized]);
  const [useProxy, setUseProxy] = useState(() => {
    return typeof navigator !== "undefined" && !!proxyUrl && isIOS();
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preferProxy =
      typeof navigator !== "undefined" && !!proxyUrl && isIOS();
    setUseProxy(preferProxy);
    setFailed(false);
  }, [normalized, proxyUrl]);

  if (!normalized || failed) {
    return <>{fallback}</>;
  }

  const handleError = () => {
    if (!useProxy && proxyUrl) {
      console.warn("Promo image failed, retrying via proxy", normalized);
      setUseProxy(true);
      return;
    }
    console.warn("Promo image failed", normalized);
    setFailed(true);
  };

  return (
    <img
      src={useProxy && proxyUrl ? proxyUrl : normalized}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      referrerPolicy={referrerPolicy}
      onError={handleError}
    />
  );
}
