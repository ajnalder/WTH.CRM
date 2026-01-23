import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowIso, getUserId } from "./_utils";

const clientGradients = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-green-600",
  "from-purple-400 to-purple-600",
  "from-red-400 to-red-600",
  "from-yellow-400 to-yellow-600",
  "from-pink-400 to-pink-600",
  "from-indigo-400 to-indigo-600",
  "from-teal-400 to-teal-600",
  "from-orange-400 to-orange-600",
  "from-cyan-400 to-cyan-600",
  "from-lime-400 to-lime-600",
  "from-rose-400 to-rose-600",
];

const DEFAULT_BLUE_GRADIENT = "from-blue-400 to-blue-600";

function getRandomGradient(exclude?: string) {
  const choices = exclude
    ? clientGradients.filter((gradient) => gradient !== exclude)
    : clientGradients;
  if (choices.length === 0) return exclude ?? DEFAULT_BLUE_GRADIENT;
  return choices[Math.floor(Math.random() * choices.length)];
}

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

export const getByIdForPromo = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    return ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", id))
      .first();
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
      klaviyo_from_email: v.optional(v.string()),
      klaviyo_from_label: v.optional(v.string()),
      klaviyo_default_audience_id: v.optional(v.string()),
      klaviyo_audiences: v.optional(v.array(v.object({ id: v.string(), label: v.optional(v.string()) }))),
      klaviyo_placed_order_metric_id: v.optional(v.string()),
      shopify_domain: v.optional(v.string()),
      shopify_admin_access_token: v.optional(v.string()),
      shopify_last_synced_at: v.optional(v.string()),
      shopify_sync_status: v.optional(v.string()),
      shopify_sync_error: v.optional(v.string()),
      shopify_product_count: v.optional(v.number()),
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

export const randomizeRecentGradients = mutation({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
    createdAfter: v.optional(v.string()),
    onlyDefaultBlue: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const onlyDefaultBlue = args.onlyDefaultBlue ?? true;
    const limit = Math.max(0, args.limit ?? 20);
    const createdAfter = args.createdAfter;

    let clients = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    clients = clients.sort((a, b) => b.created_at.localeCompare(a.created_at));

    if (createdAfter) {
      clients = clients.filter((client) => client.created_at >= createdAfter);
    }

    if (onlyDefaultBlue) {
      clients = clients.filter(
        (client) => !client.gradient || client.gradient === DEFAULT_BLUE_GRADIENT
      );
    }

    const selected = clients.slice(0, limit);

    for (const client of selected) {
      const { _id, _creationTime, ...clientData } = client as any;
      const nextGradient = getRandomGradient(client.gradient ?? undefined);
      await ctx.db.replace(_id, {
        ...clientData,
        gradient: nextGradient,
        updated_at: nowIso(),
      });
    }

    return { updatedCount: selected.length };
  },
});

export const randomizeAllGradients = mutation({
  args: {
    userId: v.optional(v.string()),
    onlyDefaultBlue: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await getUserId(ctx, args.userId);
    const onlyDefaultBlue = args.onlyDefaultBlue ?? false;

    let clients = await ctx.db.query("clients").collect();

    if (onlyDefaultBlue) {
      clients = clients.filter(
        (client) => !client.gradient || client.gradient === DEFAULT_BLUE_GRADIENT
      );
    }

    for (const client of clients) {
      const { _id, _creationTime, ...clientData } = client as any;
      const nextGradient = getRandomGradient(client.gradient ?? undefined);
      await ctx.db.replace(_id, {
        ...clientData,
        gradient: nextGradient,
        updated_at: nowIso(),
      });
    }

    return { updatedCount: clients.length };
  },
});
