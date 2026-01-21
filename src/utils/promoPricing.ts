export function formatPrice(value: number) {
  const rounded = Math.round(value * 100) / 100;
  const hasCents = Math.abs(rounded % 1) > 0;
  const formatted = new Intl.NumberFormat("en-NZ", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(rounded);

  return `$${formatted}`;
}

export function computePromoPrice(basePrice: number, promoType: string, promoValue?: number | null) {
  if (promoType === "sale_price" && typeof promoValue === "number") {
    return Math.max(0, promoValue);
  }

  if (promoType === "percent_off" && typeof promoValue === "number") {
    return Math.max(0, basePrice - basePrice * (promoValue / 100));
  }

  return basePrice;
}

export function getShortDescription(description?: string | null) {
  if (!description) return "";

  const sentenceMatch = description.match(/^[^.!?]+[.!?]/);
  if (sentenceMatch?.[0]) {
    return sentenceMatch[0].trim();
  }

  const trimmed = description.trim();
  if (trimmed.length <= 140) return trimmed;
  return `${trimmed.slice(0, 140).trim()}...`;
}

export function formatSavings(basePrice: number, promoPrice: number) {
  const savings = Math.max(0, basePrice - promoPrice);
  return formatPrice(savings);
}
