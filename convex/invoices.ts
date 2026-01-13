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
    gst_mode: v.optional(v.string()),
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
    const gstMode =
      args.gst_mode ?? (args.gst_rate === 0 ? "zero_rated" : "standard");
    const gstRate = gstMode === "zero_rated" ? 0 : args.gst_rate ?? 15;

    const invoice = {
      client_id: args.client_id,
      project_id: args.project_id,
      invoice_number: args.invoice_number,
      title: args.title,
      description: args.description,
      subtotal: args.subtotal,
      gst_rate: gstRate,
      gst_amount: args.gst_amount ?? 0,
      subtotal_incl_gst: args.subtotal_incl_gst ?? args.subtotal + (args.gst_amount ?? 0),
      gst_mode: gstMode,
      total_amount: args.total_amount,
      deposit_percentage: args.deposit_percentage ?? 0,
      deposit_amount: args.deposit_amount ?? 0,
      balance_due: args.balance_due ?? args.total_amount,
      status: args.status,
      issued_date: args.issued_date,
      due_date: args.due_date,
      paid_date: args.paid_date,
      last_emailed_at: args.last_emailed_at,
      user_id: userId,
      id: crypto.randomUUID(),
      created_at: timestamp,
      updated_at: timestamp,
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
      gst_mode: v.optional(v.string()),
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

    let updated = { ...invoice, ...args.updates, updated_at: nowIso() };

    if (args.updates.gst_rate !== undefined || args.updates.gst_mode !== undefined) {
      const items = await ctx.db
        .query("invoice_items")
        .withIndex("by_invoice", (q) => q.eq("invoice_id", invoice.id))
        .collect();

      const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const isZeroRated =
        updated.gst_mode === "zero_rated" || updated.gst_rate === 0;
      const gstRate = isZeroRated ? 0 : updated.gst_rate ?? 15;
      const gstAmount = subtotal * (gstRate / 100);
      const subtotalInclGst = subtotal + gstAmount;
      const totalAmount = subtotalInclGst;

      updated = {
        ...updated,
        subtotal,
        gst_mode: isZeroRated ? "zero_rated" : "standard",
        gst_rate: gstRate,
        gst_amount: gstAmount,
        subtotal_incl_gst: subtotalInclGst,
        total_amount: totalAmount,
        balance_due: totalAmount,
      };
    }

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

export const recalculateTotals = mutation({
  args: {
    invoiceId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    // Get the invoice
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_public_id", (q) => q.eq("id", args.invoiceId))
      .unique();
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.user_id !== userId) throw new Error("Forbidden");

    // Get all items for this invoice
    const items = await ctx.db
      .query("invoice_items")
      .withIndex("by_invoice", (q) => q.eq("invoice_id", args.invoiceId))
      .collect();

    // Calculate totals from items
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const isZeroRated = invoice.gst_mode === "zero_rated" || invoice.gst_rate === 0;
    const gstRate = isZeroRated ? 0 : invoice.gst_rate ?? 15;
    const gstAmount = subtotal * (gstRate / 100);
    const subtotalInclGst = subtotal + gstAmount;
    const totalAmount = subtotalInclGst;

    // Update the invoice with calculated totals
    const updated = {
      ...invoice,
      subtotal,
      gst_mode: isZeroRated ? "zero_rated" : "standard",
      gst_rate: gstRate,
      gst_amount: gstAmount,
      subtotal_incl_gst: subtotalInclGst,
      total_amount: totalAmount,
      balance_due: totalAmount, // Reset balance due to total amount
      updated_at: nowIso(),
    };

    await ctx.db.replace(invoice._id, updated);
    return updated;
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

    const pdfBuffer = await generateInvoicePDF(invoice, client, items, companySettings, ctx);
    // Convert Uint8Array to base64 using btoa (web-compatible)
    let binary = '';
    for (let i = 0; i < pdfBuffer.byteLength; i++) {
      binary += String.fromCharCode(pdfBuffer[i]);
    }
    const pdfBase64 = btoa(binary);
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
