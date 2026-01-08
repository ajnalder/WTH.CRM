import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowIso } from "./_utils";

export const listByQuote = query({
  args: { quoteId: v.string() },
  handler: async (ctx, args) => {
    const blocks = await ctx.db
      .query("quote_blocks")
      .withIndex("by_quote", (q) => q.eq("quote_id", args.quoteId))
      .collect();

    return blocks.sort((a, b) => a.order_index - b.order_index);
  },
});

export const create = mutation({
  args: {
    quote_id: v.string(),
    block_type: v.string(),
    content: v.optional(v.string()),
    title: v.optional(v.string()),
    image_url: v.optional(v.string()),
    order_index: v.number(),
  },
  handler: async (ctx, args) => {
    const timestamp = nowIso();
    const block = {
      id: crypto.randomUUID(),
      quote_id: args.quote_id,
      block_type: args.block_type,
      content: args.content ?? undefined,
      title: args.title ?? undefined,
      image_url: args.image_url ?? undefined,
      order_index: args.order_index,
      created_at: timestamp,
    };

    const _id = await ctx.db.insert("quote_blocks", block);
    const created = await ctx.db.get(_id);
    return created ?? block;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    updates: v.object({
      block_type: v.optional(v.string()),
      content: v.optional(v.string()),
      title: v.optional(v.string()),
      image_url: v.optional(v.string()),
      order_index: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("quote_blocks")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!block) {
      throw new Error("Quote block not found");
    }

    const updated = {
      ...block,
      ...args.updates,
    };

    await ctx.db.replace(block._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("quote_blocks")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!block) return null;

    await ctx.db.delete(block._id);
    return block._id;
  },
});
