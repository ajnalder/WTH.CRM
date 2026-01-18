import { action } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";
import { api } from "./_generated/api";

type QuoteAction = "sent" | "viewed" | "accepted";

export const sendQuoteNotification = action({
  args: {
    userId: v.optional(v.string()),
    toEmail: v.optional(v.string()),
    quoteId: v.string(),
    quoteToken: v.optional(v.string()),
    publicUrl: v.optional(v.string()),
    quoteNumber: v.string(),
    clientName: v.string(),
    totalAmount: v.number(),
    action: v.union(v.literal("sent"), v.literal("viewed"), v.literal("accepted")),
    accepted_by_name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    "use node";
    const userId = args.userId ? await getUserId(ctx, args.userId) : null;

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !fromEmail) {
      throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL must be set");
    }

    // Resolve recipient email: prefer provided, otherwise try profile
    let toEmail = args.toEmail;
    if (!toEmail && userId) {
      const profile = await ctx.runQuery(api.profiles.getById, { id: userId, userId });
      if (profile?.email) {
        toEmail = profile.email;
      }
    }

    if (!toEmail) {
      return { success: false, skipped: true, reason: "Missing recipient email" };
    }

    const quoteLink =
      args.publicUrl && args.quoteToken
        ? `${args.publicUrl.replace(/\/$/, "")}/quote/view/${args.quoteToken}`
        : null;

    const { subject, html } = buildContent(args.action, {
      clientName: args.clientName,
      quoteNumber: args.quoteNumber,
      totalAmount: args.totalAmount,
      acceptedByName: args.accepted_by_name,
      quoteLink,
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Resend failed: ${res.status} ${text}`);
    }

    // Optionally log later to a table; for now just return success
    return { success: true, sent_at: nowIso() };
  },
});

function buildContent(
  action: QuoteAction,
  opts: { clientName: string; quoteNumber: string; totalAmount: number; acceptedByName?: string; quoteLink?: string | null },
) {
  const formatter = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })} NZD`;
  const linkHtml = opts.quoteLink
    ? `<p><a href="${opts.quoteLink}">View quote</a></p>`
    : "";

  if (action === "sent") {
    return {
      subject: `Quote ${opts.quoteNumber} sent to ${opts.clientName}`,
      html: `
        <h2>Quote Sent</h2>
        <p>Your quote <strong>${opts.quoteNumber}</strong> has been sent to <strong>${opts.clientName}</strong>.</p>
        <p><strong>Total:</strong> ${formatter(opts.totalAmount)}</p>
        ${linkHtml}
      `,
    };
  }

  if (action === "viewed") {
    return {
      subject: `🔔 ${opts.clientName} viewed your quote ${opts.quoteNumber}`,
      html: `
        <h2>Quote Viewed</h2>
        <p><strong>${opts.clientName}</strong> viewed quote <strong>${opts.quoteNumber}</strong>.</p>
        <p><strong>Total:</strong> ${formatter(opts.totalAmount)}</p>
        ${linkHtml}
      `,
    };
  }

  return {
    subject: `✅ ${opts.clientName} accepted your quote ${opts.quoteNumber}!`,
    html: `
      <h2>Quote Accepted 🎉</h2>
      <p><strong>${opts.clientName}</strong> accepted quote <strong>${opts.quoteNumber}</strong>.</p>
      <p><strong>Signed by:</strong> ${opts.acceptedByName || "Unknown"}</p>
      <p><strong>Total:</strong> ${formatter(opts.totalAmount)}</p>
      ${linkHtml}
    `,
  };
}
