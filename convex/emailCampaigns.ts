import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

// CRUD Operations
export const list = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const campaigns = await ctx.db
      .query("email_campaigns")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    return campaigns.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    name: v.string(),
    subject: v.string(),
    content_html: v.string(),
    content_json: v.optional(v.any()),
    status: v.optional(v.string()),
    scheduled_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const timestamp = nowIso();

    const campaign = {
      id: crypto.randomUUID(),
      user_id: userId,
      name: args.name,
      subject: args.subject,
      content_html: args.content_html,
      content_json: args.content_json ?? undefined,
      status: args.status ?? "draft",
      recipient_count: 0,
      opened_count: 0,
      clicked_count: 0,
      delivered_count: 0,
      scheduled_at: args.scheduled_at ?? undefined,
      sent_at: undefined,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const _id = await ctx.db.insert("email_campaigns", campaign);
    const created = await ctx.db.get(_id);
    return created ?? campaign;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    updates: v.object({
      name: v.optional(v.string()),
      subject: v.optional(v.string()),
      content_html: v.optional(v.string()),
      content_json: v.optional(v.any()),
      status: v.optional(v.string()),
      scheduled_at: v.optional(v.string()),
      recipient_count: v.optional(v.number()),
      opened_count: v.optional(v.number()),
      clicked_count: v.optional(v.number()),
      delivered_count: v.optional(v.number()),
      sent_at: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const campaign = await ctx.db
      .query("email_campaigns")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!campaign) {
      throw new Error("Campaign not found");
    }
    if (campaign.user_id !== userId) {
      throw new Error("Forbidden");
    }

    const updated = {
      ...campaign,
      ...args.updates,
      updated_at: nowIso(),
    };

    await ctx.db.replace(campaign._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const campaign = await ctx.db
      .query("email_campaigns")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!campaign) return null;
    if (campaign.user_id !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(campaign._id);
    return campaign._id;
  },
});

// Send Campaign
export const sendCampaign = mutation({
  args: {
    userId: v.optional(v.string()),
    campaignId: v.string(),
    testEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    "use node";
    const userId = await getUserId(ctx, args.userId);

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !fromEmail) {
      throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL must be set");
    }

    const campaign = await ctx.db
      .query("email_campaigns")
      .withIndex("by_user", (q: any) => q.eq("user_id", userId))
      .filter((q: any) => q.eq(q.field("id"), args.campaignId))
      .unique();
    if (!campaign) throw new Error("Campaign not found");

    // Recipients
    let recipients: { id: string; email: string; name?: string }[] = [];
    if (args.testEmail) {
      recipients = [{ id: "test", email: args.testEmail, name: "Test User" }];
    } else {
      const contacts = await ctx.db
        .query("contacts")
        .filter((q: any) => q.eq(q.field("email_subscribed"), true))
        .filter((q: any) => q.eq(q.field("unsubscribed_at"), undefined))
        .collect();
      recipients = contacts.map((c: any) => ({ id: c.id, email: c.email, name: c.name ?? undefined }));
    }

    if (recipients.length === 0) throw new Error("No recipients found");

    // Mark campaign sending
    await ctx.db.replace(campaign._id, {
      ...campaign,
      status: "sending",
      recipient_count: recipients.length,
      updated_at: nowIso(),
    });

    let successCount = 0;
    let errorCount = 0;
    const batchSize = 10;
    const unsubscribeBase = process.env.UNSUBSCRIBE_BASE_URL;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (contact) => {
          try {
            const unsubscribeUrl = unsubscribeBase
              ? `${unsubscribeBase}?contact=${contact.id}`
              : undefined;
            const emailContent =
              campaign.content_html +
              (unsubscribeUrl
                ? `
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
              <p>You received this email because you're subscribed to our mailing list.</p>
              <p><a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a></p>
            </div>
          `
                : "");

            const sendRecord = {
              id: crypto.randomUUID(),
              campaign_id: campaign.id,
              contact_id: contact.id,
              email_address: contact.email,
              status: "pending",
              created_at: nowIso(),
            };
            const sendId = await ctx.db.insert("campaign_sends", sendRecord);

            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                from: fromEmail,
                to: contact.email,
                subject: campaign.subject,
                html: emailContent,
                headers: unsubscribeUrl
                  ? {
                      "List-Unsubscribe": `<${unsubscribeUrl}>`,
                      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                    }
                  : undefined,
              }),
            });

            if (!res.ok) {
              const text = await res.text();
              await ctx.db.patch(sendId, {
                status: "failed",
                error_message: text,
              });
              errorCount++;
              return;
            }

            await ctx.db.patch(sendId, {
              status: "sent",
              sent_at: nowIso(),
              delivered_at: nowIso(),
            });
            successCount++;
          } catch (err: any) {
            console.error("Campaign send error:", err);
            errorCount++;
          }
        }),
      );

      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    await ctx.db.replace(campaign._id, {
      ...campaign,
      status: errorCount === 0 ? "sent" : "sending",
      sent_at: nowIso(),
      delivered_count: successCount,
      updated_at: nowIso(),
    });

    return {
      success: true,
      totalRecipients: recipients.length,
      successCount,
      errorCount,
    };
  },
});
