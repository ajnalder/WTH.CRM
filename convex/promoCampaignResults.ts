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

export const refreshResultsForPortal = action({
  args: { clientId: v.string(), token: v.string(), promotionId: v.string() },
  handler: async (ctx, { clientId, token, promotionId }) => {
    await assertValidPortalToken(ctx, clientId, token);

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
    const now = nowIso();

    const current = await ctx.db
      .query("promo_campaign_results")
      .withIndex("by_promotion", (q) => q.eq("promotion_id", promotionId))
      .first();

    if (current) {
      await ctx.db.patch(current._id, {
        campaign_id: fetched.campaignId,
        name: fetched.name,
        status: fetched.status,
        send_date: fetched.sendDate,
        open_rate: fetched.openRate,
        click_rate: fetched.clickRate,
        placed_order_value: fetched.placedOrderValue,
        placed_order_count: fetched.placedOrderCount,
        refreshed_at: fetched.refreshedAt,
        updated_at: now,
      });
    } else {
      await ctx.db.insert("promo_campaign_results", {
        id: generateId(),
        promotion_id: promotionId,
        campaign_id: fetched.campaignId,
        name: fetched.name,
        status: fetched.status,
        send_date: fetched.sendDate,
        open_rate: fetched.openRate,
        click_rate: fetched.clickRate,
        placed_order_value: fetched.placedOrderValue,
        placed_order_count: fetched.placedOrderCount,
        refreshed_at: fetched.refreshedAt,
        created_at: now,
        updated_at: now,
      });
    }

    const results = await ctx.db
      .query("promo_campaign_results")
      .withIndex("by_promotion", (q) => q.eq("promotion_id", promotionId))
      .collect();

    return { ok: true, results, refreshedAt: fetched.refreshedAt };
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
    const now = nowIso();

    const current = await ctx.db
      .query("promo_campaign_results")
      .withIndex("by_promotion", (q) => q.eq("promotion_id", promotionId))
      .first();

    if (current) {
      await ctx.db.patch(current._id, {
        campaign_id: fetched.campaignId,
        name: fetched.name,
        status: fetched.status,
        send_date: fetched.sendDate,
        open_rate: fetched.openRate,
        click_rate: fetched.clickRate,
        placed_order_value: fetched.placedOrderValue,
        placed_order_count: fetched.placedOrderCount,
        refreshed_at: fetched.refreshedAt,
        updated_at: now,
      });
    } else {
      await ctx.db.insert("promo_campaign_results", {
        id: generateId(),
        promotion_id: promotionId,
        campaign_id: fetched.campaignId,
        name: fetched.name,
        status: fetched.status,
        send_date: fetched.sendDate,
        open_rate: fetched.openRate,
        click_rate: fetched.clickRate,
        placed_order_value: fetched.placedOrderValue,
        placed_order_count: fetched.placedOrderCount,
        refreshed_at: fetched.refreshedAt,
        created_at: now,
        updated_at: now,
      });
    }

    return { ok: true, refreshedAt: fetched.refreshedAt };
  },
});
