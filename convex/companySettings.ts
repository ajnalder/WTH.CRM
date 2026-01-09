import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

export const get = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const settings = await ctx.db
      .query("company_settings")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .first();
    return settings ?? null;
  },
});

export const upsert = mutation({
  args: {
    userId: v.optional(v.string()),
    updates: v.object({
      company_name: v.optional(v.string()),
      logo_base64: v.optional(v.string()),
      logo_inverse_base64: v.optional(v.string()),
      logo_storage_id: v.optional(v.string()),
      logo_inverse_storage_id: v.optional(v.string()),
      address_line1: v.optional(v.string()),
      address_line2: v.optional(v.string()),
      address_line3: v.optional(v.string()),
      gst_number: v.optional(v.string()),
      bank_details: v.optional(v.string()),
      bank_account: v.optional(v.string()),
      owner_name: v.optional(v.string()),
      xero_account_code: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const existing = await ctx.db
      .query("company_settings")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .first();

    const timestamp = nowIso();

    if (existing) {
      const updated = { ...existing, ...args.updates, updated_at: timestamp };
      await ctx.db.replace(existing._id, updated);
      return updated;
    }

    const settings = {
      id: crypto.randomUUID(),
      user_id: userId,
      created_at: timestamp,
      updated_at: timestamp,
      company_name: args.updates.company_name ?? "",
      logo_base64: args.updates.logo_base64 ?? undefined,
      logo_inverse_base64: args.updates.logo_inverse_base64 ?? undefined,
      logo_storage_id: args.updates.logo_storage_id ?? undefined,
      logo_inverse_storage_id: args.updates.logo_inverse_storage_id ?? undefined,
      address_line1: args.updates.address_line1 ?? undefined,
      address_line2: args.updates.address_line2 ?? undefined,
      address_line3: args.updates.address_line3 ?? undefined,
      gst_number: args.updates.gst_number ?? undefined,
      bank_details: args.updates.bank_details ?? undefined,
      bank_account: args.updates.bank_account ?? undefined,
      owner_name: args.updates.owner_name ?? undefined,
      xero_account_code: args.updates.xero_account_code ?? undefined,
    };

    const _id = await ctx.db.insert("company_settings", settings);
    return (await ctx.db.get(_id)) ?? settings;
  },
});
