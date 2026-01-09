import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

export const listByInvoice = query({
  args: { invoiceId: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    // Verify invoice ownership
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_public_id", (q: any) => q.eq("id", args.invoiceId))
      .unique();

    if (!invoice || invoice.user_id !== userId) {
      return [];
    }

    // Get email logs for this invoice
    const logs = await ctx.db
      .query("email_logs")
      .withIndex("by_invoice", (q) => q.eq("invoice_id", args.invoiceId))
      .collect();

    return logs.sort((a, b) => b.sent_at.localeCompare(a.sent_at));
  },
});

export const create = mutation({
  args: {
    invoiceId: v.string(),
    userId: v.optional(v.string()),
    recipient_email: v.string(),
    subject: v.string(),
    status: v.string(),
    sent_at: v.string(),
    error_message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    // Verify invoice ownership
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_public_id", (q: any) => q.eq("id", args.invoiceId))
      .unique();

    if (!invoice || invoice.user_id !== userId) {
      throw new Error("Invoice not found");
    }

    const log = {
      id: crypto.randomUUID(),
      invoice_id: args.invoiceId,
      recipient_email: args.recipient_email,
      subject: args.subject,
      status: args.status,
      sent_at: args.sent_at,
      error_message: args.error_message,
      created_at: nowIso(),
    };

    const _id = await ctx.db.insert("email_logs", log);
    return (await ctx.db.get(_id)) ?? log;
  },
});
