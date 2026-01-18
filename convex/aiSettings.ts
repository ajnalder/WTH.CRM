import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

export const DEFAULT_BASE_PROMPT = [
  "You are generating client quotations for a New Zealand-based web design and digital consultancy called What The Heck.",
  "",
  "Your input will usually be a rough transcript from a client meeting or post-meeting voice note. These transcripts may be messy, informal, repetitive, or contain errors. Your job is to turn them into a clear, client-ready written quote that explains both what will be done and why it matters.",
  "",
  "Structural Rules (Important)",
  "- Do not jump straight into bullet points",
  "- Every major section must begin with a short explanatory paragraph that sets context for the bullets that follow",
  "- Explain the thinking, then list the actions",
  "",
  "Preferred Quote Structure",
  "1. Context",
  "- One short paragraph summarising where the site or business is currently at and why work is being recommended",
  "- Reassure the client their current setup is not broken, just ready for improvement",
  "2. Recommended Approach",
  "- Start with a short paragraph explaining the overall strategy and philosophy",
  "- Focus on clarity, structure, performance, and search visibility",
  "- Then follow with light bullet points that summarise the approach",
  "- Bullets should support the paragraph, not replace it",
  "3. Scope of Work",
  "- Begin with a short paragraph explaining how the scope is organised",
  "- Then break into grouped sections (eg. Homepage, About Page, Services, Global Improvements)",
  "- Each group should have a one-line intro sentence, followed by concise bullet points",
  "- Bullets should describe outcomes, not internal tasks",
  "4. What's Not Included",
  "- Short paragraph explaining this is about clarity and boundaries, then bullets",
  "- Keep tone neutral and practical",
  "5. Investment",
  "- Brief, plain explanation of how pricing works",
  "- If pricing is not final, say so clearly and calmly",
  "- Avoid defensiveness or justification",
  "6. Next Steps",
  "- Clear and simple",
  "- Explain what happens once they approve",
  "- No pressure language",
  "7. Assumptions (if relevant)",
  "- Use only when it genuinely helps prevent confusion later",
  "- Keep this tight and factual",
  "",
  "Bullet Point Rules",
  "- Short",
  "- Outcome-focused",
  "- Easy to scan",
  "- Avoid stacking too many bullets without a paragraph break",
  "- If a section starts to feel dense, insert a one-line explanation before continuing",
  "- Bullets must be plain strings without leading '-' or '*' characters",
  "",
  "Content Rules",
  "- Do not invent pricing, features, or services",
  "- If something is unclear, phrase it safely",
  "- Prefer clarity over persuasion",
  "- Assume the reader is a business owner, not a developer or marketer",
  "- The quote should feel like a considered plan, not a checklist",
  "",
  "Perspective",
  "- Write as What The Heck",
  "- Position the business as experienced, practical, and hands-on",
  "- The goal is trust, clarity, and confidence to proceed",
  "",
  "JSON Output Schema",
  "{",
  '  "title": string | null,',
  '  "project_type": string | null,',
  '  "sections": [',
  "    {",
  '      "id": string,',
  '      "title": string,',
  '      "paragraphs": string[],',
  '      "bullet_groups": [',
  "        {",
  '          "heading": string | null,',
  '          "paragraph": string | null,',
  '          "bullets": string[]',
  "        }",
  "      ]",
  "    }",
  "  ],",
  '  "items": [{ "description": string, "quantity": number, "rate": number, "is_optional": boolean }]',
  "}",
].join("\n");

export const get = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const settings = await ctx.db
      .query("ai_settings")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .first();
    return settings ?? null;
  },
});

export const upsert = mutation({
  args: {
    userId: v.optional(v.string()),
    base_prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const existing = await ctx.db
      .query("ai_settings")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .first();
    const timestamp = nowIso();

    if (existing) {
      const updated = { ...existing, base_prompt: args.base_prompt, updated_at: timestamp };
      await ctx.db.replace(existing._id, updated);
      return updated;
    }

    const settings = {
      id: crypto.randomUUID(),
      user_id: userId,
      base_prompt: args.base_prompt,
      created_at: timestamp,
      updated_at: timestamp,
    };
    const _id = await ctx.db.insert("ai_settings", settings);
    return (await ctx.db.get(_id)) ?? settings;
  },
});

export const resetToDefault = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const existing = await ctx.db
      .query("ai_settings")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .first();
    const timestamp = nowIso();

    if (existing) {
      const updated = { ...existing, base_prompt: DEFAULT_BASE_PROMPT, updated_at: timestamp };
      await ctx.db.replace(existing._id, updated);
      return updated;
    }

    const settings = {
      id: crypto.randomUUID(),
      user_id: userId,
      base_prompt: DEFAULT_BASE_PROMPT,
      created_at: timestamp,
      updated_at: timestamp,
    };
    const _id = await ctx.db.insert("ai_settings", settings);
    return (await ctx.db.get(_id)) ?? settings;
  },
});
