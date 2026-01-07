import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";
async function getInvoice(ctx: QueryCtx | MutationCtx, invoiceId: string, userId: string) {
  const invoice = await ctx.db
    .query("invoices")
    .withIndex("by_public_id", (q: any) => q.eq("id", invoiceId))
    .unique();
  if (!invoice || invoice.user_id !== userId) throw new Error("Invoice not found");
  return invoice;
}

export const listByInvoice = query({
  args: { invoiceId: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    await getInvoice(ctx, args.invoiceId, userId);
    const payments = await ctx.db
      .query("invoice_payments")
      .withIndex("by_invoice", (q) => q.eq("invoice_id", args.invoiceId))
      .collect();
    return payments.sort((a, b) => (b.payment_date ?? "").localeCompare(a.payment_date ?? ""));
  },
});

export const create = mutation({
  args: {
    invoiceId: v.string(),
    userId: v.optional(v.string()),
    amount: v.number(),
    payment_method: v.optional(v.string()),
    payment_date: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const invoice = await getInvoice(ctx, args.invoiceId, userId);
    const payment = {
      id: crypto.randomUUID(),
      invoice_id: args.invoiceId,
      amount: args.amount,
      payment_method: args.payment_method ?? undefined,
      payment_date: args.payment_date ?? nowIso(),
      notes: args.notes ?? undefined,
      created_at: nowIso(),
    };
    const _id = await ctx.db.insert("invoice_payments", payment);

    // Update invoice balance
    const newBalance = Math.max((invoice.balance_due ?? invoice.total_amount) - args.amount, 0);
    await ctx.db.replace(invoice._id, {
      ...invoice,
      balance_due: newBalance,
      updated_at: nowIso(),
    });

    return (await ctx.db.get(_id)) ?? payment;
  },
});
