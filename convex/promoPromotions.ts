import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import {
  assertAdmin,
  assertValidPortalToken,
  computePromoPrice,
} from "./promoUtils";
import { nowIso } from "./_utils";
import { createKlaviyoCampaignDraft, getKlaviyoAudienceOptions } from "./klaviyo";
import { generateId } from "./promoUtils";
import { api } from "./_generated/api";

const PROMO_STATUSES = [
  "submitted",
  "draft",
  "accepted",
  "generated",
  "sent",
  "archived",
];

function formatPrice(value: number) {
  const rounded = Math.round(value * 100) / 100;
  const hasCents = Math.abs(rounded % 1) > 0;
  const formatted = new Intl.NumberFormat("en-NZ", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(rounded);

  return `$${formatted}`;
}

function formatBullets(bullets?: string[]) {
  if (!bullets || bullets.length === 0) return [];
  return bullets.map((bullet) => `- ${bullet}`);
}

function resolveProductLink(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `https://golf360.co.nz${normalized}`;
}

function buildCanvaBlocks(items: any[]) {
  return items
    .filter((item: any) => item.product)
    .map((item: any) => {
      const product = item.product;
      const promoPrice = item.promo_price ?? product.price;
      const showWas =
        typeof product.compare_at_price === "number" &&
        product.compare_at_price > promoPrice;

      return {
        productId: product.id,
        name: product.short_title || product.title,
        price: formatPrice(promoPrice),
        wasPrice: showWas ? formatPrice(product.compare_at_price) : null,
        bullets: product.bullet_points ?? [],
        link: resolveProductLink(product.product_url),
        imageUrl: product.image_url,
      };
    });
}

async function getPromotionById(ctx: any, promotionId: string) {
  return ctx.db
    .query("promo_promotions")
    .withIndex("by_public_id", (q: any) => q.eq("id", promotionId))
    .first();
}

async function getPromotionItems(ctx: any, promotionId: string) {
  const items = await ctx.db
    .query("promo_promotion_items")
    .withIndex("by_promotion", (q: any) => q.eq("promotion_id", promotionId))
    .collect();

  return items.sort((a: any, b: any) => a.position - b.position);
}

async function hydratePromotion(ctx: any, promotionId: string) {
  const promotion = await getPromotionById(ctx, promotionId);
  if (!promotion) {
    return null;
  }

  const items = await getPromotionItems(ctx, promotionId);
  const products = await Promise.all(
    items.map((item: any) =>
      ctx.db
        .query("promo_products")
        .withIndex("by_public_id", (q: any) => q.eq("id", item.product_id))
        .first()
    )
  );

  const hydratedItems = items.map((item: any, index: number) => ({
    ...item,
    product: products[index],
  }));

  return { promotion, items: hydratedItems };
}

export const listPromotionsForPortal = query({
  args: { clientId: v.string(), token: v.string() },
  handler: async (ctx, { clientId, token }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const promotions = await ctx.db
      .query("promo_promotions")
      .withIndex("by_client", (q) => q.eq("client_id", clientId))
      .collect();

    return promotions.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },
});

export const listPromotionsForAdmin = query({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    await assertAdmin(ctx);

    const promotions = await ctx.db
      .query("promo_promotions")
      .withIndex("by_client", (q) => q.eq("client_id", clientId))
      .collect();

    return promotions.sort((a, b) => {
      const statusA = PROMO_STATUSES.indexOf(a.status);
      const statusB = PROMO_STATUSES.indexOf(b.status);
      if (statusA === statusB) {
        return a.created_at < b.created_at ? 1 : -1;
      }
      return statusA - statusB;
    });
  },
});

export const createPromotion = mutation({
  args: {
    clientId: v.string(),
    token: v.string(),
    name: v.string(),
    noteToAndrew: v.optional(v.string()),
  },
  handler: async (ctx, { clientId, token, name, noteToAndrew }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const now = nowIso();
    const id = generateId();

    await ctx.db.insert("promo_promotions", {
      id,
      client_id: clientId,
      name,
      note_to_andrew: noteToAndrew,
      status: "draft",
      created_by: "client",
      created_at: now,
      updated_at: now,
    });

    return id;
  },
});

export const addPromotionItem = mutation({
  args: {
    clientId: v.string(),
    token: v.string(),
    promotionId: v.string(),
    productId: v.string(),
  },
  handler: async (ctx, { clientId, token, promotionId, productId }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const promotion = await getPromotionById(ctx, promotionId);
    if (!promotion || promotion.client_id !== clientId) {
      throw new Error("Promotion not found.");
    }

    if (promotion.status !== "draft") {
      throw new Error("Promotion is locked.");
    }

    const product = await ctx.db
      .query("promo_products")
      .withIndex("by_public_id", (q) => q.eq("id", productId))
      .first();

    if (!product || product.client_id !== clientId) {
      throw new Error("Product not found.");
    }

    const existing = await ctx.db
      .query("promo_promotion_items")
      .withIndex("by_promotion", (q) => q.eq("promotion_id", promotionId))
      .filter((q) => q.eq(q.field("product_id"), productId))
      .first();

    if (existing) {
      return existing;
    }

    const items = await getPromotionItems(ctx, promotionId);
    const position = items.length + 1;

    const now = nowIso();
    await ctx.db.insert("promo_promotion_items", {
      id: generateId(),
      promotion_id: promotionId,
      product_id: productId,
      position,
      promo_type: "none",
      created_at: now,
      updated_at: now,
    });

    return { ok: true };
  },
});

export const updatePromotionItem = mutation({
  args: {
    clientId: v.string(),
    token: v.string(),
    promotionId: v.string(),
    itemId: v.string(),
    promoType: v.string(),
    promoValue: v.optional(v.number()),
  },
  handler: async (ctx, { clientId, token, promotionId, itemId, promoType, promoValue }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const promotion = await getPromotionById(ctx, promotionId);
    if (!promotion || promotion.client_id !== clientId) {
      throw new Error("Promotion not found.");
    }

    if (promotion.status !== "draft") {
      throw new Error("Promotion is locked.");
    }

    const item = await ctx.db
      .query("promo_promotion_items")
      .withIndex("by_public_id", (q) => q.eq("id", itemId))
      .first();

    if (!item || item.promotion_id !== promotionId) {
      throw new Error("Promotion item not found.");
    }

    const product = await ctx.db
      .query("promo_products")
      .withIndex("by_public_id", (q) => q.eq("id", item.product_id))
      .first();

    if (!product) {
      throw new Error("Product not found.");
    }

    const normalizedValue = promoType === "none" ? undefined : promoValue ?? undefined;
    const promoPrice = computePromoPrice(product.price, promoType, normalizedValue ?? null);

    await ctx.db.patch(item._id, {
      promo_type: promoType,
      promo_value: normalizedValue,
      promo_price: promoPrice,
      updated_at: nowIso(),
    });

    return { ok: true };
  },
});

export const removePromotionItem = mutation({
  args: {
    clientId: v.string(),
    token: v.string(),
    promotionId: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, { clientId, token, promotionId, itemId }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const promotion = await getPromotionById(ctx, promotionId);
    if (!promotion || promotion.client_id !== clientId) {
      throw new Error("Promotion not found.");
    }

    if (promotion.status !== "draft") {
      throw new Error("Promotion is locked.");
    }

    const item = await ctx.db
      .query("promo_promotion_items")
      .withIndex("by_public_id", (q) => q.eq("id", itemId))
      .first();

    if (!item || item.promotion_id !== promotionId) {
      throw new Error("Promotion item not found.");
    }

    await ctx.db.delete(item._id);
    return { ok: true };
  },
});

export const submitPromotion = mutation({
  args: { clientId: v.string(), token: v.string(), promotionId: v.string() },
  handler: async (ctx, { clientId, token, promotionId }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const promotion = await getPromotionById(ctx, promotionId);
    if (!promotion || promotion.client_id !== clientId) {
      throw new Error("Promotion not found.");
    }

    if (promotion.status !== "draft") {
      return { ok: true };
    }

    const now = nowIso();
    await ctx.db.patch(promotion._id, {
      status: "submitted",
      submitted_at: now,
      updated_at: now,
    });

    return { ok: true };
  },
});

export const updatePromotionDetails = mutation({
  args: {
    clientId: v.string(),
    token: v.string(),
    promotionId: v.string(),
    name: v.string(),
    noteToAndrew: v.optional(v.string()),
  },
  handler: async (ctx, { clientId, token, promotionId, name, noteToAndrew }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const promotion = await getPromotionById(ctx, promotionId);
    if (!promotion || promotion.client_id !== clientId) {
      throw new Error("Promotion not found.");
    }

    if (promotion.status !== "draft") {
      throw new Error("Promotion is locked.");
    }

    await ctx.db.patch(promotion._id, {
      name,
      note_to_andrew: noteToAndrew,
      updated_at: nowIso(),
    });

    return { ok: true };
  },
});

export const deletePromotion = mutation({
  args: { clientId: v.string(), token: v.string(), promotionId: v.string() },
  handler: async (ctx, { clientId, token, promotionId }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const promotion = await getPromotionById(ctx, promotionId);
    if (!promotion || promotion.client_id !== clientId) {
      throw new Error("Promotion not found.");
    }

    if (promotion.status !== "draft") {
      throw new Error("Only draft promotions can be deleted.");
    }

    const items = await getPromotionItems(ctx, promotionId);
    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(promotion._id);
    return { ok: true };
  },
});

export const setKlaviyoCampaignId = mutation({
  args: { promotionId: v.string(), campaignId: v.string() },
  handler: async (ctx, { promotionId, campaignId }) => {
    await assertAdmin(ctx);

    const promotion = await getPromotionById(ctx, promotionId);
    if (!promotion) {
      throw new Error("Promotion not found.");
    }

    await ctx.db.patch(promotion._id, {
      klaviyo_campaign_id: campaignId.trim(),
      updated_at: nowIso(),
    });

    return { ok: true };
  },
});

export const setKlaviyoCampaignSelections = mutation({
  args: {
    promotionId: v.string(),
    selectedSubjectLine: v.optional(v.string()),
    selectedPreviewText: v.optional(v.string()),
    selectedAudienceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const promotion = await getPromotionById(ctx, args.promotionId);
    if (!promotion) {
      throw new Error("Promotion not found.");
    }

    await ctx.db.patch(promotion._id, {
      selected_subject_line: args.selectedSubjectLine?.trim() || undefined,
      selected_preview_text: args.selectedPreviewText?.trim() || undefined,
      selected_audience_id: args.selectedAudienceId?.trim() || undefined,
      updated_at: nowIso(),
    });

    return { ok: true };
  },
});

export const getKlaviyoAudienceOptionsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) {
      return [];
    }

    const settings = await ctx.db
      .query("company_settings")
      .withIndex("by_user", (q) => q.eq("user_id", identity.subject))
      .first();

    return getKlaviyoAudienceOptions(settings ?? undefined);
  },
});

export const createKlaviyoCampaignForPromotion = action({
  args: { promotionId: v.string() },
  handler: async (ctx, { promotionId }) => {
    await assertAdmin(ctx);

    const promotionData = await ctx.runQuery("promoPromotions:getPromotionForAdmin" as any, {
      promotionId,
    });
    const promotion = promotionData?.promotion;
    if (!promotion) {
      throw new Error("Promotion not found.");
    }

    if (promotion.klaviyo_campaign_id) {
      throw new Error("Klaviyo campaign ID already linked.");
    }

    const name =
      promotion.generated_campaign_title?.trim() || promotion.name || "Promotion Campaign";
    const subjectLine =
      promotion.selected_subject_line ||
      promotion.generated_subject_lines?.[0] ||
      promotion.name;
    const previewText =
      promotion.selected_preview_text || promotion.generated_preview_texts?.[0];

    if (!subjectLine || !previewText) {
      throw new Error("Select a subject line and preview text before creating the campaign.");
    }

    const settings = await ctx.runQuery("companySettings:get" as any, {});
    const audienceOptions = getKlaviyoAudienceOptions(settings ?? undefined);

    const { campaignId } = await createKlaviyoCampaignDraft(name, {
      audienceId: promotion.selected_audience_id,
      subjectLine,
      previewText,
      fromEmail: settings?.klaviyo_from_email,
      fromLabel: settings?.klaviyo_from_label,
      audienceOptions,
      defaultAudienceId: settings?.klaviyo_default_audience_id,
    });
    await ctx.runMutation("promoPromotions:setKlaviyoCampaignId" as any, {
      promotionId,
      campaignId,
    });

    return { ok: true, campaignId };
  },
});

export const getPromotionForPortal = query({
  args: { clientId: v.string(), token: v.string(), promotionId: v.string() },
  handler: async (ctx, { clientId, token, promotionId }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const result = await hydratePromotion(ctx, promotionId);
    if (!result || result.promotion.client_id !== clientId) {
      return null;
    }

    return result;
  },
});

export const getPromotionForAdmin = query({
  args: { promotionId: v.string() },
  handler: async (ctx, { promotionId }) => {
    await assertAdmin(ctx);
    return hydratePromotion(ctx, promotionId);
  },
});

export const getCanvaPackForAdmin = query({
  args: { promotionId: v.string() },
  handler: async (ctx, { promotionId }) => {
    await assertAdmin(ctx);

    const pack = await ctx.db
      .query("promo_canva_packs")
      .withIndex("by_promotion", (q) => q.eq("promotion_id", promotionId))
      .first();

    if (!pack) return null;

    const promotion = await getPromotionById(ctx, promotionId);

    return {
      blocks: pack.blocks,
      campaign: promotion
        ? {
            generated_campaign_title: promotion.generated_campaign_title,
            generated_subject_lines: promotion.generated_subject_lines,
            generated_preview_texts: promotion.generated_preview_texts,
            generated_opening_paragraph: promotion.generated_opening_paragraph,
            generated_at: promotion.generated_at,
          }
        : null,
    };
  },
});

export const saveCanvaPack = mutation({
  args: { promotionId: v.string(), blocks: v.any() },
  handler: async (ctx, { promotionId, blocks }) => {
    await assertAdmin(ctx);
    const existing = await ctx.db
      .query("promo_canva_packs")
      .withIndex("by_promotion", (q) => q.eq("promotion_id", promotionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        blocks,
        updated_at: nowIso(),
      });
      return { ok: true };
    }

    await ctx.db.insert("promo_canva_packs", {
      id: generateId(),
      promotion_id: promotionId,
      blocks,
      created_at: nowIso(),
      updated_at: nowIso(),
    });

    return { ok: true };
  },
});

export const setGeneratedCampaignCopy = mutation({
  args: {
    promotionId: v.string(),
    campaignTitle: v.string(),
    subjectLines: v.array(v.string()),
    previewTexts: v.array(v.string()),
    openingParagraph: v.string(),
    generatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      promotionId,
      campaignTitle,
      subjectLines,
      previewTexts,
      openingParagraph,
      generatedAt,
    }
  ) => {
    await assertAdmin(ctx);

    const promotion = await getPromotionById(ctx, promotionId);
    if (!promotion) {
      throw new Error("Promotion not found.");
    }

    await ctx.db.patch(promotion._id, {
      generated_campaign_title: campaignTitle,
      generated_subject_lines: subjectLines,
      generated_preview_texts: previewTexts,
      generated_opening_paragraph: openingParagraph,
      generated_at: generatedAt,
      updated_at: nowIso(),
    });

    return { ok: true };
  },
});

export const generateCanvaPackForAdmin = action({
  args: { promotionId: v.string() },
  handler: async (
    ctx,
    { promotionId }
  ): Promise<{
    blocks: any[];
    campaign: {
      generated_campaign_title?: string;
      generated_subject_lines?: string[];
      generated_preview_texts?: string[];
      generated_opening_paragraph?: string;
      generated_at?: string;
    };
  }> => {
    await assertAdmin(ctx);

    await ctx.runAction(api.promoAi.generateCampaignCopyForPromotion, {
      promotionId,
    });

    const result = (await ctx.runQuery(api.promoPromotions.getPromotionForAdmin, {
      promotionId,
    })) as any;
    if (!result) {
      throw new Error("Promotion not found.");
    }

    const blocks = buildCanvaBlocks(result.items);
    await ctx.runMutation(api.promoPromotions.saveCanvaPack, {
      promotionId,
      blocks,
    });

    return {
      blocks,
      campaign: {
        generated_campaign_title: result.promotion.generated_campaign_title,
        generated_subject_lines: result.promotion.generated_subject_lines,
        generated_preview_texts: result.promotion.generated_preview_texts,
        generated_opening_paragraph: result.promotion.generated_opening_paragraph,
        generated_at: result.promotion.generated_at,
      },
    };
  },
});
