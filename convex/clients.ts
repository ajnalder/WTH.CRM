import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowIso, getUserId } from "./_utils";

export const list = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    return clients.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
});

export const getById = query({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!client) return null;
    if (client.user_id !== userId) {
      throw new Error("Forbidden");
    }

    return client;
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    company: v.string(),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    joined_date: v.optional(v.string()),
    avatar: v.optional(v.string()),
    gradient: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const timestamp = nowIso();
    console.log("clients.create", { userId, company: args.company });

    const client = {
      id: crypto.randomUUID(),
      user_id: userId,
      company: args.company,
      phone: args.phone ?? undefined,
      description: args.description ?? undefined,
      status: args.status ?? "active",
      joined_date: args.joined_date ?? timestamp,
      avatar: args.avatar ?? undefined,
      gradient: args.gradient ?? undefined,
      projects_count: 0,
      total_value: 0,
      created_at: timestamp,
      updated_at: timestamp,
      xero_contact_id: undefined,
    };

    const _id = await ctx.db.insert("clients", client);
    const created = await ctx.db.get(_id);
    return created ?? client;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    updates: v.object({
      company: v.optional(v.string()),
      phone: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(v.string()),
      joined_date: v.optional(v.string()),
      avatar: v.optional(v.string()),
      gradient: v.optional(v.string()),
      projects_count: v.optional(v.number()),
      total_value: v.optional(v.number()),
      xero_contact_id: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!client) {
      throw new Error("Client not found");
    }
    if (client.user_id !== userId) {
      throw new Error("Forbidden");
    }

    // Extract only the fields we want to update (exclude Convex internal fields)
    const { _id, _creationTime, ...clientData } = client;
    // Also strip internal fields from the updates if they were accidentally included
    const { _id: _updateId, _creationTime: _updateCreationTime, ...cleanUpdates } = args.updates as any;

    const updated = {
      ...clientData,
      ...cleanUpdates,
      updated_at: nowIso(),
    };

    await ctx.db.replace(_id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!client) {
      return null;
    }
    if (client.user_id !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(client._id);
    return client._id;
  },
});
