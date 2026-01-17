import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowIso, getUserId } from "./_utils";

export const listByQuote = query({
  args: { quoteId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const quoteId = args.quoteId;
    if (!quoteId) {
      return [];
    }
    const items = await ctx.db
      .query("quote_items")
      .withIndex("by_quote", (q) => q.eq("quote_id", quoteId))
      .collect();

    return items.sort((a, b) => a.order_index - b.order_index);
  },
});

export const create = mutation({
  args: {
    quote_id: v.string(),
    description: v.string(),
    quantity: v.number(),
    rate: v.number(),
    amount: v.number(),
    is_optional: v.boolean(),
    order_index: v.number(),
  },
  handler: async (ctx, args) => {
    const timestamp = nowIso();
    const item = {
      id: crypto.randomUUID(),
      quote_id: args.quote_id,
      description: args.description,
      quantity: args.quantity,
      rate: args.rate,
      amount: args.amount,
      is_optional: args.is_optional,
      order_index: args.order_index,
      created_at: timestamp,
    };

    const _id = await ctx.db.insert("quote_items", item);
    const created = await ctx.db.get(_id);
    return created ?? item;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    updates: v.object({
      description: v.optional(v.string()),
      quantity: v.optional(v.number()),
      rate: v.optional(v.number()),
      amount: v.optional(v.number()),
      is_optional: v.optional(v.boolean()),
      order_index: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("quote_items")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!item) {
      throw new Error("Quote item not found");
    }

    const updated = {
      ...item,
      ...args.updates,
    };

    await ctx.db.replace(item._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("quote_items")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!item) return null;

    await ctx.db.delete(item._id);
    return item._id;
  },
});
