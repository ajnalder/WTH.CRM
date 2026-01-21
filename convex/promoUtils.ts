import { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
import { getUserId, nowIso } from "./_utils";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashToken(token: string) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export function generateRawToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function generateId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return generateRawToken().slice(0, 32);
}

export async function assertValidPortalToken(
  ctx: QueryCtx | MutationCtx,
  clientId: string,
  token: string
) {
  const match = await ctx.db
    .query("promo_clients")
    .withIndex("by_public_id", (q) => q.eq("id", clientId))
    .first();

  if (!match || !match.portal_token_hash) {
    throw new Error("Invalid or missing portal token.");
  }

  const tokenHash = await hashToken(token);
  if (match.portal_token_hash !== tokenHash) {
    throw new Error("Invalid or missing portal token.");
  }

  return match;
}

export function computePromoPrice(
  basePrice: number,
  promoType: string,
  promoValue?: number | null
) {
  if (promoType === "sale_price" && typeof promoValue === "number") {
    return Math.max(0, promoValue);
  }

  if (promoType === "percent_off" && typeof promoValue === "number") {
    return Math.max(0, basePrice - basePrice * (promoValue / 100));
  }

  return basePrice;
}

export function promoTimestamps() {
  const now = nowIso();
  return { created_at: now, updated_at: now };
}

export function updateTimestamp() {
  return { updated_at: nowIso() };
}

export async function assertAdmin(ctx: ActionCtx | MutationCtx | QueryCtx) {
  await getUserId(ctx);
}
