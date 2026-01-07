import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

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
