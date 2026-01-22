import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { assertAdmin, assertValidPortalToken } from "./promoUtils";
import { generateId } from "./promoUtils";
import { nowIso } from "./_utils";
import { fetchCampaignResults } from "./klaviyo";

const REFRESH_TTL_MS = 1000 * 60 * 15;

function isFresh(timestamp?: string | null) {
  if (!timestamp) return false;
  const parsed = Date.parse(timestamp);
  if (!Number.isFinite(parsed)) return false;
  return Date.now() - parsed < REFRESH_TTL_MS;
}

export const getResultsForPortal = query({
  args: { clientId: v.string(), token: v.string(), promotionId: v.string() },
  handler: async (ctx, { clientId, token, promotionId }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const results = await ctx.db
      .query("promo_campaign_results")
      .withIndex("by_promotion", (q) => q.eq("promotion_id", promotionId))
      .collect();

    return {
      results,
      refreshedAt: results[0]?.refreshed_at ?? null,
    };
  },
});

export const upsertCampaignResult = mutation({
  args: {
    promotionId: v.string(),
    campaignId: v.string(),
    name: v.string(),
    status: v.optional(v.string()),
    sendDate: v.optional(v.string()),
    openRate: v.optional(v.number()),
    clickRate: v.optional(v.number()),
    placedOrderValue: v.optional(v.number()),
    placedOrderCount: v.optional(v.number()),
    refreshedAt: v.string(),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const now = nowIso();
    const existing = await ctx.db
      .query("promo_campaign_results")
      .withIndex("by_promotion", (q) => q.eq("promotion_id", args.promotionId))
      .first();

    const payload = {
      campaign_id: args.campaignId,
      name: args.name,
      status: args.status,
      send_date: args.sendDate,
      open_rate: args.openRate,
      click_rate: args.clickRate,
      placed_order_value: args.placedOrderValue,
      placed_order_count: args.placedOrderCount,
      refreshed_at: args.refreshedAt,
      updated_at: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return { ok: true, id: existing.id };
    }

    await ctx.db.insert("promo_campaign_results", {
      id: generateId(),
      promotion_id: args.promotionId,
      ...payload,
      created_at: now,
    });

    return { ok: true };
  },
});

export const refreshResultsForPortal = action({
  args: { clientId: v.string(), token: v.string(), promotionId: v.string() },
  handler: async (ctx, { clientId, token, promotionId }) => {
    await ctx.runQuery("promoClients:validatePortalToken" as any, { clientId, token });

    const promotion = await ctx.runQuery("promoPromotions:getPromotionForPortal" as any, {
      clientId,
      token,
      promotionId,
    });

    if (!promotion?.promotion) {
      throw new Error("Promotion not found.");
    }

    const campaignId = promotion.promotion.klaviyo_campaign_id;
    if (!campaignId) {
      throw new Error("Klaviyo campaign ID not linked yet.");
    }

    const existing = await ctx.runQuery("promoCampaignResults:getResultsForPortal" as any, {
      clientId,
      token,
      promotionId,
    });

    if (existing?.refreshedAt && isFresh(existing.refreshedAt)) {
      return { ok: true, results: existing.results, refreshedAt: existing.refreshedAt };
    }

    const fetched = await fetchCampaignResults(campaignId);
    await ctx.runMutation("promoCampaignResults:upsertCampaignResult" as any, {
      promotionId,
      campaignId: fetched.campaignId,
      name: fetched.name,
      status: fetched.status,
      sendDate: fetched.sendDate,
      openRate: fetched.openRate,
      clickRate: fetched.clickRate,
      placedOrderValue: fetched.placedOrderValue,
      placedOrderCount: fetched.placedOrderCount,
      refreshedAt: fetched.refreshedAt,
    });

    const results = await ctx.runQuery("promoCampaignResults:getResultsForPortal" as any, {
      clientId,
      token,
      promotionId,
    });

    return { ok: true, results: results?.results ?? [], refreshedAt: fetched.refreshedAt };
  },
});

export const refreshResultsForAdmin = action({
  args: { promotionId: v.string() },
  handler: async (ctx, { promotionId }) => {
    await assertAdmin(ctx);

    const promotion = await ctx.runQuery("promoPromotions:getPromotionForAdmin" as any, {
      promotionId,
    });

    if (!promotion?.promotion) {
      throw new Error("Promotion not found.");
    }

    const campaignId = promotion.promotion.klaviyo_campaign_id;
    if (!campaignId) {
      throw new Error("Klaviyo campaign ID not linked yet.");
    }

    const fetched = await fetchCampaignResults(campaignId);
    await ctx.runMutation("promoCampaignResults:upsertCampaignResult" as any, {
      promotionId,
      campaignId: fetched.campaignId,
      name: fetched.name,
      status: fetched.status,
      sendDate: fetched.sendDate,
      openRate: fetched.openRate,
      clickRate: fetched.clickRate,
      placedOrderValue: fetched.placedOrderValue,
      placedOrderCount: fetched.placedOrderCount,
      refreshedAt: fetched.refreshedAt,
    });

    return { ok: true, refreshedAt: fetched.refreshedAt };
  },
});
