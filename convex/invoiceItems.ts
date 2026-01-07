import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";
import { getById as getInvoiceById } from "./invoices";

async function assertInvoiceOwnership(ctx: any, invoiceId: string, userId: string) {
  const invoice = await ctx.runQuery(getInvoiceById, { id: invoiceId, userId });
  if (!invoice) {
    throw new Error("Invoice not found");
  }
  return invoice;
}

export const listByInvoice = query({
  args: { invoiceId: v.optional(v.string()), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.invoiceId) {
      return [];
    }
    const userId = await getUserId(ctx, args.userId);
    await assertInvoiceOwnership(ctx, args.invoiceId, userId);
    const items = await ctx.db
      .query("invoice_items")
      .withIndex("by_invoice", (q) => q.eq("invoice_id", args.invoiceId!))
      .collect();
    return items.sort((a, b) => a.created_at.localeCompare(b.created_at));
  },
});

export const create = mutation({
  args: {
    invoiceId: v.string(),
    userId: v.optional(v.string()),
    description: v.string(),
    quantity: v.number(),
    rate: v.number(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    await assertInvoiceOwnership(ctx, args.invoiceId, userId);
    const item = {
      id: crypto.randomUUID(),
      invoice_id: args.invoiceId,
      description: args.description,
      quantity: args.quantity,
      rate: args.rate,
      amount: args.amount,
      created_at: nowIso(),
    };
    const _id = await ctx.db.insert("invoice_items", item);
    return (await ctx.db.get(_id)) ?? item;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    updates: v.object({
      description: v.optional(v.string()),
      quantity: v.optional(v.number()),
      rate: v.optional(v.number()),
      amount: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const item = await ctx.db
      .query("invoice_items")
      .filter((q) => q.eq(q.field("id"), args.id))
      .unique();

    if (!item) {
      throw new Error("Invoice item not found");
    }

    await assertInvoiceOwnership(ctx, item.invoice_id, userId);
    const updated = { ...item, ...args.updates };
    await ctx.db.replace(item._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const item = await ctx.db
      .query("invoice_items")
      .filter((q) => q.eq(q.field("id"), args.id))
      .unique();
    if (!item) return null;
    await assertInvoiceOwnership(ctx, item.invoice_id, userId);
    await ctx.db.delete(item._id);
    return item._id;
  },
});
