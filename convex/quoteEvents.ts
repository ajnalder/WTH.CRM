import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowIso } from "./_utils";

export const listByQuote = query({
  args: { quoteId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("quote_events")
      .withIndex("by_quote", (q) => q.eq("quote_id", args.quoteId))
      .collect();

    return events.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
});

export const create = mutation({
  args: {
    quote_id: v.string(),
    event_type: v.string(),
    ip_address: v.optional(v.string()),
    user_agent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = nowIso();
    const event = {
      id: crypto.randomUUID(),
      quote_id: args.quote_id,
      event_type: args.event_type,
      ip_address: args.ip_address ?? undefined,
      user_agent: args.user_agent ?? undefined,
      created_at: timestamp,
    };

    const _id = await ctx.db.insert("quote_events", event);
    const created = await ctx.db.get(_id);
    return created ?? event;
  },
});
