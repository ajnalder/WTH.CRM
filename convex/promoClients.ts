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
      const promoClient = await ctx.db
        .query("promo_clients")
        .withIndex("by_crm_client", (q) => q.eq("crm_client_id", crmClient.id))
        .first();
      results.push({
        crmClient: { id: crmClient.id, name: crmClient.company },
        promoClient: promoClient
          ? {
              id: promoClient.id,
              name: promoClient.name,
              portal_token_hash: promoClient.portal_token_hash ?? undefined,
            }
          : null,
      });
    }

    return results;
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
    createdAt: v.string(),
    rotatedAt: v.string(),
  },
  handler: async (ctx, { clientId, tokenHash, createdAt, rotatedAt }) => {
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
