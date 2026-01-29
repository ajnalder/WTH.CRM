import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getUserId, nowIso } from "./_utils";
import { assertAdmin, hashToken, generateId, generateRawToken } from "./promoUtils";

const DEFAULT_CLIENT_NAME = "Golf 360";

export const ensureDefaultClient = mutation({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const existing = await ctx.db
      .query("promo_clients")
      .withIndex("by_name", (q) => q.eq("name", DEFAULT_CLIENT_NAME))
      .first();

    if (existing) {
      return existing;
    }

    const now = nowIso();
    const id = generateId();
    await ctx.db.insert("promo_clients", {
      id,
      name: DEFAULT_CLIENT_NAME,
      created_at: now,
      updated_at: now,
    });

    return await ctx.db
      .query("promo_clients")
      .withIndex("by_public_id", (q) => q.eq("id", id))
      .first();
  },
});

export const ensurePromoClientForCrm = mutation({
  args: { crmClientId: v.string() },
  handler: async (ctx, { crmClientId }) => {
    await assertAdmin(ctx);
    const userId = await getUserId(ctx);

    const crmClient = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", crmClientId))
      .first();

    if (!crmClient || crmClient.user_id !== userId) {
      throw new Error("Client not found.");
    }

    const existing = await ctx.db
      .query("promo_clients")
      .withIndex("by_crm_client", (q) => q.eq("crm_client_id", crmClientId))
      .first();

    if (existing) {
      return existing;
    }

    const legacyMatch = await ctx.db
      .query("promo_clients")
      .withIndex("by_name", (q) => q.eq("name", crmClient.company))
      .filter((q) => q.eq(q.field("crm_client_id"), undefined))
      .first();

    if (legacyMatch) {
      await ctx.db.patch(legacyMatch._id, {
        crm_client_id: crmClientId,
        updated_at: nowIso(),
      });
      return { ...legacyMatch, crm_client_id: crmClientId };
    }

    const now = nowIso();
    const id = generateId();
    await ctx.db.insert("promo_clients", {
      id,
      crm_client_id: crmClientId,
      name: crmClient.company,
      created_at: now,
      updated_at: now,
    });

    return await ctx.db
      .query("promo_clients")
      .withIndex("by_public_id", (q) => q.eq("id", id))
      .first();
  },
});

export const listCrmClientsForPromo = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);
    const userId = await getUserId(ctx);

    const crmClients = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    const results = [];
    for (const crmClient of crmClients) {
      let promoClient = await ctx.db
        .query("promo_clients")
        .withIndex("by_crm_client", (q) => q.eq("crm_client_id", crmClient.id))
        .first();
      if (!promoClient) {
        promoClient = await ctx.db
          .query("promo_clients")
          .withIndex("by_name", (q) => q.eq("name", crmClient.company))
          .filter((q) => q.eq(q.field("crm_client_id"), undefined))
          .first();
      }

      let productCount = 0;
      if (promoClient) {
        const products = await ctx.db
          .query("promo_products")
          .withIndex("by_client", (q) => q.eq("client_id", promoClient.id))
          .collect();
        productCount = products.length;
      }
      results.push({
        crmClient: { id: crmClient.id, name: crmClient.company },
        promoClient: promoClient
          ? {
              id: promoClient.id,
              name: promoClient.name,
              portal_token_hash: promoClient.portal_token_hash ?? undefined,
              portal_token: promoClient.portal_token ?? undefined,
              product_count: productCount,
            }
          : null,
      });
    }

    return results;
  },
});

export const listPromoClientsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);
    const promoClients = await ctx.db.query("promo_clients").collect();
    const results = [];
    for (const client of promoClients) {
      const products = await ctx.db
        .query("promo_products")
        .withIndex("by_client", (q) => q.eq("client_id", client.id))
        .collect();
      results.push({
        id: client.id,
        name: client.name,
        crm_client_id: client.crm_client_id ?? null,
        portal_token_hash: client.portal_token_hash ?? null,
        portal_token: client.portal_token ?? null,
        product_count: products.length,
      });
    }
    return results;
  },
});

export const linkPromoClientToCrm = mutation({
  args: { crmClientId: v.string(), promoClientId: v.string() },
  handler: async (ctx, { crmClientId, promoClientId }) => {
    await assertAdmin(ctx);
    const userId = await getUserId(ctx);

    const crmClient = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", crmClientId))
      .first();
    if (!crmClient || crmClient.user_id !== userId) {
      throw new Error("Client not found.");
    }

    const promoClient = await ctx.db
      .query("promo_clients")
      .withIndex("by_public_id", (q) => q.eq("id", promoClientId))
      .first();
    if (!promoClient) {
      throw new Error("Promo client not found.");
    }

    if (promoClient.crm_client_id && promoClient.crm_client_id !== crmClientId) {
      throw new Error("Promo client is already linked to another CRM client.");
    }

    await ctx.db.patch(promoClient._id, {
      crm_client_id: crmClientId,
      name: crmClient.company,
      updated_at: nowIso(),
    });

    return { ok: true };
  },
});

export const migratePromoClientData = mutation({
  args: {
    crmClientId: v.string(),
    fromPromoClientId: v.string(),
    toPromoClientId: v.string(),
  },
  handler: async (ctx, { crmClientId, fromPromoClientId, toPromoClientId }) => {
    await assertAdmin(ctx);
    const userId = await getUserId(ctx);

    if (fromPromoClientId === toPromoClientId) {
      throw new Error("Source and destination are the same.");
    }

    const crmClient = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", crmClientId))
      .first();
    if (!crmClient || crmClient.user_id !== userId) {
      throw new Error("Client not found.");
    }

    const source = await ctx.db
      .query("promo_clients")
      .withIndex("by_public_id", (q) => q.eq("id", fromPromoClientId))
      .first();
    if (!source) {
      throw new Error("Source promo client not found.");
    }
    if (source.crm_client_id && source.crm_client_id !== crmClientId) {
      throw new Error("Source promo client is linked to another CRM client.");
    }

    const destination = await ctx.db
      .query("promo_clients")
      .withIndex("by_public_id", (q) => q.eq("id", toPromoClientId))
      .first();
    if (!destination) {
      throw new Error("Destination promo client not found.");
    }

    const now = nowIso();
    await ctx.db.patch(destination._id, {
      crm_client_id: crmClientId,
      name: crmClient.company,
      updated_at: now,
    });
    if (source.crm_client_id === crmClientId) {
      await ctx.db.patch(source._id, {
        crm_client_id: undefined,
        updated_at: now,
      });
    }

    const products = await ctx.db
      .query("promo_products")
      .withIndex("by_client", (q) => q.eq("client_id", fromPromoClientId))
      .collect();
    for (const product of products) {
      await ctx.db.patch(product._id, {
        client_id: toPromoClientId,
        updated_at: now,
      });
    }

    const promotions = await ctx.db
      .query("promo_promotions")
      .withIndex("by_client", (q) => q.eq("client_id", fromPromoClientId))
      .collect();
    for (const promotion of promotions) {
      await ctx.db.patch(promotion._id, {
        client_id: toPromoClientId,
        updated_at: now,
      });
    }

    return {
      ok: true,
      movedProducts: products.length,
      movedPromotions: promotions.length,
    };
  },
});

export const backfillKlaviyoSettingsToClient = mutation({
  args: { crmClientId: v.string() },
  handler: async (ctx, { crmClientId }) => {
    await assertAdmin(ctx);
    const userId = await getUserId(ctx);

    const crmClient = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", crmClientId))
      .first();
    if (!crmClient || crmClient.user_id !== userId) {
      throw new Error("Client not found.");
    }

    const settings = await ctx.db
      .query("company_settings")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .first();

    if (!settings) {
      return { ok: false, reason: "No company settings found." };
    }

    await ctx.db.patch(crmClient._id, {
      klaviyo_from_email: settings.klaviyo_from_email ?? undefined,
      klaviyo_from_label: settings.klaviyo_from_label ?? undefined,
      klaviyo_default_audience_id: settings.klaviyo_default_audience_id ?? undefined,
      klaviyo_audiences: settings.klaviyo_audiences ?? undefined,
      klaviyo_placed_order_metric_id: settings.klaviyo_placed_order_metric_id ?? undefined,
      updated_at: nowIso(),
    });

    return { ok: true };
  },
});

export const getClientById = query({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    await assertAdmin(ctx);
    return ctx.db
      .query("promo_clients")
      .withIndex("by_public_id", (q) => q.eq("id", clientId))
      .first();
  },
});

export const getDefaultClient = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);
    return ctx.db
      .query("promo_clients")
      .withIndex("by_name", (q) => q.eq("name", DEFAULT_CLIENT_NAME))
      .first();
  },
});

export const setPortalTokenHash = mutation({
  args: {
    clientId: v.string(),
    tokenHash: v.string(),
    portalToken: v.string(),
    createdAt: v.string(),
    rotatedAt: v.string(),
  },
  handler: async (ctx, { clientId, tokenHash, portalToken, createdAt, rotatedAt }) => {
    await assertAdmin(ctx);

    const record = await ctx.db
      .query("promo_clients")
      .withIndex("by_public_id", (q) => q.eq("id", clientId))
      .first();

    if (!record) {
      throw new Error("Client not found.");
    }

    await ctx.db.patch(record._id, {
      portal_token_hash: tokenHash,
      portal_token: portalToken,
      portal_token_created_at: record.portal_token_created_at ?? createdAt,
      portal_token_rotated_at: rotatedAt,
      updated_at: nowIso(),
    });

    return record;
  },
});

export const generatePortalToken = action({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    await assertAdmin(ctx);

    const rawToken = generateRawToken();
    const tokenHash = await hashToken(rawToken);
    const timestamp = nowIso();

    await ctx.runMutation("promoClients:setPortalTokenHash" as any, {
      clientId,
      tokenHash,
      portalToken: rawToken,
      createdAt: timestamp,
      rotatedAt: timestamp,
    });

    return { token: rawToken, createdAt: timestamp, rotatedAt: timestamp };
  },
});

export const rotatePortalToken = action({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    await assertAdmin(ctx);

    const rawToken = generateRawToken();
    const tokenHash = await hashToken(rawToken);
    const timestamp = nowIso();

    await ctx.runMutation("promoClients:setPortalTokenHash" as any, {
      clientId,
      tokenHash,
      portalToken: rawToken,
      createdAt: timestamp,
      rotatedAt: timestamp,
    });

    return { token: rawToken, rotatedAt: timestamp };
  },
});

export const validatePortalToken = query({
  args: { clientId: v.string(), token: v.string() },
  handler: async (ctx, { clientId, token }) => {
    const client = await ctx.db
      .query("promo_clients")
      .withIndex("by_public_id", (q) => q.eq("id", clientId))
      .first();

    if (!client || !client.portal_token_hash) {
      return { valid: false } as const;
    }

    const tokenHash = await hashToken(token);
    if (tokenHash !== client.portal_token_hash) {
      return { valid: false } as const;
    }

    return { valid: true, client: { id: client.id, name: client.name } } as const;
  },
});
