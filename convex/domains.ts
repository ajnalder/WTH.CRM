import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

export const listByUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    if (clients.length === 0) return [];

    const clientMap = new Map(clients.map((client) => [client.id, client]));
    const domains: any[] = [];

    for (const client of clients) {
      const clientDomains = await ctx.db
        .query("domains")
        .withIndex("by_client", (q) => q.eq("client_id", client.id))
        .collect();

      for (const domain of clientDomains) {
        domains.push({
          ...domain,
          client_company: client.company,
        });
      }
    }

    return domains.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    client_id: v.string(),
    name: v.string(),
    registrar: v.string(),
    platform: v.string(),
    renewal_cost: v.number(),
    renewal_date: v.string(),
    client_managed: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", args.client_id))
      .unique();

    if (!client || client.user_id !== userId) {
      throw new Error("Client not found or forbidden");
    }

    const timestamp = nowIso();
    const domain = {
      id: crypto.randomUUID(),
      client_id: args.client_id,
      name: args.name,
      registrar: args.registrar,
      platform: args.platform,
      renewal_cost: args.renewal_cost,
      renewal_date: args.renewal_date,
      client_managed: args.client_managed,
      notes: args.notes ?? undefined,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const _id = await ctx.db.insert("domains", domain);
    const created = await ctx.db.get(_id);
    return created ?? domain;
  },
});

export const update = mutation({
  args: {
    userId: v.optional(v.string()),
    id: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      registrar: v.optional(v.string()),
      platform: v.optional(v.string()),
      renewal_cost: v.optional(v.number()),
      renewal_date: v.optional(v.string()),
      client_managed: v.optional(v.boolean()),
      notes: v.optional(v.string()),
      client_id: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const domain = await ctx.db
      .query("domains")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!domain) {
      throw new Error("Domain not found");
    }

    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", domain.client_id))
      .unique();

    if (!client || client.user_id !== userId) {
      throw new Error("Forbidden");
    }

    let targetClientId = domain.client_id;
    if (args.updates.client_id && args.updates.client_id !== domain.client_id) {
      const newClient = await ctx.db
        .query("clients")
        .withIndex("by_public_id", (q) => q.eq("id", args.updates.client_id!))
        .unique();

      if (!newClient || newClient.user_id !== userId) {
        throw new Error("Target client not found or forbidden");
      }
      targetClientId = newClient.id;
    }

    const updated = {
      ...domain,
      ...args.updates,
      client_id: targetClientId,
      updated_at: nowIso(),
    };

    await ctx.db.replace(domain._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { userId: v.optional(v.string()), id: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const domain = await ctx.db
      .query("domains")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!domain) return null;

    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", domain.client_id))
      .unique();

    if (!client || client.user_id !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(domain._id);
    return domain._id;
  },
});
