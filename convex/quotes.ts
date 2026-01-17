import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowIso, getUserId } from "./_utils";

export const list = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    // Fetch client data and ensure missing fields don't break the UI.
    const quotesWithClients = await Promise.all(
      quotes.map(async (quote) => {
        const client = await ctx.db
          .query("clients")
          .withIndex("by_public_id", (q) => q.eq("id", quote.client_id))
          .unique();
        let totalAmount = quote.total_amount;
        if (typeof totalAmount !== "number") {
          const items = await ctx.db
            .query("quote_items")
            .withIndex("by_quote", (q) => q.eq("quote_id", quote.id))
            .collect();
          totalAmount = items
            .filter((item) => !item.is_optional)
            .reduce((sum, item) => sum + item.amount, 0);
        }

        return {
          ...quote,
          status: quote.status ?? "draft",
          total_amount: totalAmount ?? 0,
          created_at: quote.created_at ?? quote.updated_at ?? nowIso(),
          updated_at: quote.updated_at ?? quote.created_at ?? nowIso(),
          clients: client ? { id: client.id, company: client.company } : null,
        };
      })
    );

    return quotesWithClients.sort((a, b) =>
      (b.created_at ?? "").localeCompare(a.created_at ?? "")
    );
  },
});

export const getById = query({
  args: { id: v.optional(v.string()), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    const userId = await getUserId(ctx, args.userId);

    const quote = await ctx.db
      .query("quotes")
      .filter((q) => q.eq(q.field("id"), args.id))
      .unique();

    if (!quote) return null;
    if (quote.user_id !== userId) {
      throw new Error("Forbidden");
    }

    // Fetch client data
    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", quote.client_id))
      .unique();

    return {
      ...quote,
      clients: client ? { id: client.id, company: client.company } : null,
    };
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const quote = await ctx.db
      .query("quotes")
      .withIndex("by_token", (q) => q.eq("public_token", args.token))
      .unique();

    if (!quote) return null;

    // Fetch client data
    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", quote.client_id))
      .unique();

    return {
      ...quote,
      clients: client ? { id: client.id, company: client.company } : null,
    };
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    client_id: v.string(),
    title: v.string(),
    project_type: v.optional(v.string()),
    valid_until: v.optional(v.string()),
    deposit_percentage: v.optional(v.number()),
    total_amount: v.optional(v.number()),
    contact_name: v.optional(v.string()),
    contact_email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    // Get user profile for creator name
    const profile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("id"), userId))
      .first();

    // Generate next quote number
    const existingQuotes = await ctx.db
      .query("quotes")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    let nextNumber = 1;
    if (existingQuotes.length > 0) {
      const numbers = existingQuotes
        .map((q) => parseInt(q.quote_number.replace("QUO-", ""), 10))
        .filter((n) => !isNaN(n));
      if (numbers.length > 0) {
        nextNumber = Math.max(...numbers) + 1;
      }
    }
    const quoteNumber = `QUO-${String(nextNumber).padStart(4, "0")}`;

    const timestamp = nowIso();
    const quote = {
      id: crypto.randomUUID(),
      user_id: userId,
      client_id: args.client_id,
      public_token: crypto.randomUUID(),
      quote_number: quoteNumber,
      title: args.title,
      status: "draft",
      project_type: args.project_type ?? undefined,
      creator_name: profile?.full_name ?? undefined,
      contact_name: args.contact_name ?? undefined,
      contact_email: args.contact_email ?? undefined,
      cover_image_url: undefined,
      deposit_percentage: args.deposit_percentage ?? 50,
      total_amount: args.total_amount ?? 0,
      accepted_at: undefined,
      accepted_by_name: undefined,
      valid_until: args.valid_until ?? undefined,
      viewed_at: undefined,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const _id = await ctx.db.insert("quotes", quote);
    const created = await ctx.db.get(_id);
    return created ?? quote;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    updates: v.object({
      title: v.optional(v.string()),
      project_type: v.optional(v.string()),
      status: v.optional(v.string()),
      contact_name: v.optional(v.string()),
      contact_email: v.optional(v.string()),
      cover_image_url: v.optional(v.string()),
      deposit_percentage: v.optional(v.number()),
      total_amount: v.optional(v.number()),
      accepted_at: v.optional(v.string()),
      accepted_by_name: v.optional(v.string()),
      valid_until: v.optional(v.string()),
      viewed_at: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const quote = await ctx.db
      .query("quotes")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!quote) {
      throw new Error("Quote not found");
    }
    if (quote.user_id !== userId) {
      throw new Error("Forbidden");
    }

    const updated = {
      ...quote,
      ...args.updates,
      updated_at: nowIso(),
    };

    await ctx.db.replace(quote._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const quote = await ctx.db
      .query("quotes")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!quote) return null;
    if (quote.user_id !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(quote._id);
    return quote._id;
  },
});
