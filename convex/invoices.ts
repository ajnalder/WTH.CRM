import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";
import { api } from "./_generated/api";
import { createEmailTemplate, generateInvoicePDF } from "./invoicePDF";

export const list = query({
  args: { userId: v.optional(v.string()), clientId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const invoices = args.clientId
      ? await ctx.db
          .query("invoices")
          .withIndex("by_client", (q) => q.eq("client_id", args.clientId!))
          .filter((q) => q.eq(q.field("user_id"), userId))
          .collect()
      : await ctx.db
          .query("invoices")
          .withIndex("by_user", (q) => q.eq("user_id", userId))
          .collect();

    return invoices.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
});

export const getById = query({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();
    if (!invoice || invoice.user_id !== userId) return null;
    return invoice;
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    client_id: v.string(),
    project_id: v.optional(v.string()),
    invoice_number: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    subtotal: v.number(),
    gst_rate: v.optional(v.number()),
    gst_amount: v.optional(v.number()),
    subtotal_incl_gst: v.optional(v.number()),
    total_amount: v.number(),
    deposit_percentage: v.optional(v.number()),
    deposit_amount: v.optional(v.number()),
    balance_due: v.optional(v.number()),
    status: v.string(),
    issued_date: v.optional(v.string()),
    due_date: v.optional(v.string()),
    paid_date: v.optional(v.string()),
    last_emailed_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const timestamp = nowIso();
    const { userId: _userId, ...invoiceData } = args; // Remove userId from spread
    const invoice = {
      ...invoiceData,
      user_id: userId,
      id: crypto.randomUUID(),
      gst_rate: args.gst_rate ?? 0,
      gst_amount: args.gst_amount ?? 0,
      subtotal_incl_gst: args.subtotal_incl_gst ?? args.subtotal + (args.gst_amount ?? 0),
      deposit_percentage: args.deposit_percentage ?? 0,
      deposit_amount: args.deposit_amount ?? 0,
      balance_due: args.balance_due ?? args.total_amount,
      created_at: timestamp,
      updated_at: timestamp,
      xero_invoice_id: undefined,
    };
    const _id = await ctx.db.insert("invoices", invoice);
    return (await ctx.db.get(_id)) ?? invoice;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    updates: v.object({
      client_id: v.optional(v.string()),
      project_id: v.optional(v.string()),
      invoice_number: v.optional(v.string()),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      subtotal: v.optional(v.number()),
      gst_rate: v.optional(v.number()),
      gst_amount: v.optional(v.number()),
      subtotal_incl_gst: v.optional(v.number()),
      total_amount: v.optional(v.number()),
      deposit_percentage: v.optional(v.number()),
      deposit_amount: v.optional(v.number()),
      balance_due: v.optional(v.number()),
      status: v.optional(v.string()),
      issued_date: v.optional(v.string()),
      due_date: v.optional(v.string()),
      paid_date: v.optional(v.string()),
      last_emailed_at: v.optional(v.string()),
      xero_invoice_id: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .filter((q) => q.eq(q.field("id"), args.id))
      .unique();
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const updated = { ...invoice, ...args.updates, updated_at: nowIso() };
    await ctx.db.replace(invoice._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();
    if (!invoice) return null;
    if (invoice.user_id !== userId) throw new Error("Forbidden");

    // delete related records
    const items = await ctx.db
      .query("invoice_items")
      .withIndex("by_invoice", (q) => q.eq("invoice_id", invoice.id))
      .collect();
    for (const item of items) await ctx.db.delete(item._id);

    const payments = await ctx.db
      .query("invoice_payments")
      .withIndex("by_invoice", (q) => q.eq("invoice_id", invoice.id))
      .collect();
    for (const payment of payments) await ctx.db.delete(payment._id);

    const logs = await ctx.db
      .query("email_logs")
      .withIndex("by_invoice", (q) => q.eq("invoice_id", invoice.id))
      .collect();
    for (const log of logs) await ctx.db.delete(log._id);

    await ctx.db.delete(invoice._id);
    return invoice.id;
  },
});

export const sendInvoiceEmail = action({
  args: {
    userId: v.optional(v.string()),
    invoiceId: v.string(),
    to: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // use node for outbound network calls
    'use node';

    const userId = await getUserId(ctx, args.userId);
    const invoice = await ctx.runQuery(api.invoices.getById, { id: args.invoiceId, userId });
    if (!invoice) throw new Error("Invoice not found");

    const [items, client, companySettings] = await Promise.all([
      ctx.runQuery(api.invoiceItems.listByInvoice, { invoiceId: invoice.id, userId }),
      ctx.runQuery(api.clients.getById, { id: invoice.client_id, userId }),
      ctx.runQuery(api.companySettings.get, { userId }),
    ]);

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !fromEmail) {
      throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL must be set");
    }

    const pdfBuffer = await generateInvoicePDF(invoice, client, items, companySettings);
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
    const html = createEmailTemplate(args.message, client?.company || "Customer", companySettings);
    const timestamp = nowIso();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: args.to,
        subject: args.subject,
        html,
        attachments: [
          {
            filename: `Invoice-${invoice.invoice_number}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Resend failed: ${res.status} ${text}`);
    }

    await ctx.runMutation(api.invoices.createEmailLog, {
      invoiceId: invoice.id,
      recipient_email: args.to,
      subject: args.subject,
      status: "sent",
      sent_at: timestamp,
      error_message: undefined,
    });

    await ctx.runMutation(api.invoices.update, {
      id: invoice.id,
      userId,
      updates: {
        last_emailed_at: timestamp,
        status: invoice.status === "draft" ? "sent" : invoice.status,
      },
    });

    return { success: true };
  },
});

// Legacy placeholder (kept for API completeness)
export const createEmailLog = mutation({
  args: {
    invoiceId: v.string(),
    recipient_email: v.string(),
    subject: v.string(),
    status: v.string(),
    sent_at: v.string(),
    error_message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const log = {
      id: crypto.randomUUID(),
      invoice_id: args.invoiceId,
      recipient_email: args.recipient_email,
      subject: args.subject,
      status: args.status,
      sent_at: args.sent_at,
      error_message: args.error_message ?? undefined,
      created_at: nowIso(),
    };
    const _id = await ctx.db.insert("email_logs", log);
    return (await ctx.db.get(_id)) ?? log;
  },
});

// -------------------- below: data mutations/queries --------------------

export const sendInvoiceEmailLegacy = mutation({
  args: {
    userId: v.optional(v.string()),
    invoiceId: v.string(),
    to: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_public_id", (q) => q.eq("id", args.invoiceId))
      .unique();
    if (!invoice || invoice.user_id !== userId) throw new Error("Invoice not found");

    const timestamp = nowIso();

    // Record an email log (stub - actual email sending should be implemented here)
    await ctx.db.insert("email_logs", {
      id: crypto.randomUUID(),
      invoice_id: invoice.id,
      recipient_email: args.to,
      subject: args.subject,
      status: "sent",
      sent_at: timestamp,
      error_message: undefined,
      created_at: timestamp,
    });

    // Update invoice metadata
    await ctx.db.replace(invoice._id, {
      ...invoice,
      last_emailed_at: timestamp,
      status: invoice.status === "draft" ? "sent" : invoice.status,
      updated_at: timestamp,
    });

    return { success: true };
  },
});
