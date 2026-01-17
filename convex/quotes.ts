import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { nowIso, getUserId } from "./_utils";

export const list = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    // Fetch client data and ensure missing fields don't break the UI.
    const quotesWithClients = await Promise.all(
      quotes.map(async (quote) => {
        const client = await ctx.db
          .query("clients")
          .withIndex("by_public_id", (q) => q.eq("id", quote.client_id))
          .unique();
        let totalAmount = quote.total_amount;
        if (typeof totalAmount !== "number") {
          const items = await ctx.db
            .query("quote_items")
            .withIndex("by_quote", (q) => q.eq("quote_id", quote.id))
            .collect();
          totalAmount = items
            .filter((item) => !item.is_optional)
            .reduce((sum, item) => sum + item.amount, 0);
        }

        return {
          ...quote,
          status: quote.status ?? "draft",
          total_amount: totalAmount ?? 0,
          created_at: quote.created_at ?? quote.updated_at ?? nowIso(),
          updated_at: quote.updated_at ?? quote.created_at ?? nowIso(),
          clients: client ? { id: client.id, company: client.company } : null,
        };
      })
    );

    return quotesWithClients.sort((a, b) =>
      (b.created_at ?? "").localeCompare(a.created_at ?? "")
    );
  },
});

export const getById = query({
  args: { id: v.optional(v.string()), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    const userId = await getUserId(ctx, args.userId);

    const quote = await ctx.db
      .query("quotes")
      .filter((q) => q.eq(q.field("id"), args.id))
      .unique();

    if (!quote) return null;
    if (quote.user_id !== userId) {
      throw new Error("Forbidden");
    }

    // Fetch client data
    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", quote.client_id))
      .unique();

    return {
      ...quote,
      clients: client ? { id: client.id, company: client.company } : null,
    };
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const quote = await ctx.db
      .query("quotes")
      .withIndex("by_token", (q) => q.eq("public_token", args.token))
      .unique();

    if (!quote) return null;

    // Fetch client data
    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", quote.client_id))
      .unique();

    return {
      ...quote,
      clients: client ? { id: client.id, company: client.company } : null,
    };
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    client_id: v.string(),
    title: v.string(),
    project_type: v.optional(v.string()),
    valid_until: v.optional(v.string()),
    deposit_percentage: v.optional(v.number()),
    total_amount: v.optional(v.number()),
    contact_name: v.optional(v.string()),
    contact_email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    // Get user profile for creator name
    const profile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("id"), userId))
      .first();

    // Generate next quote number
    const existingQuotes = await ctx.db
      .query("quotes")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    let nextNumber = 1;
    if (existingQuotes.length > 0) {
      const numbers = existingQuotes
        .map((q) => parseInt(q.quote_number.replace("QUO-", ""), 10))
        .filter((n) => !isNaN(n));
      if (numbers.length > 0) {
        nextNumber = Math.max(...numbers) + 1;
      }
    }
    const quoteNumber = `QUO-${String(nextNumber).padStart(4, "0")}`;

    const timestamp = nowIso();
    const quote = {
      id: crypto.randomUUID(),
      user_id: userId,
      client_id: args.client_id,
      public_token: crypto.randomUUID(),
      quote_number: quoteNumber,
      title: args.title,
      status: "draft",
      project_type: args.project_type ?? undefined,
      creator_name: profile?.full_name ?? undefined,
      contact_name: args.contact_name ?? undefined,
      contact_email: args.contact_email ?? undefined,
      cover_image_url: undefined,
      deposit_percentage: args.deposit_percentage ?? 50,
      total_amount: args.total_amount ?? 0,
      accepted_at: undefined,
      accepted_by_name: undefined,
      valid_until: args.valid_until ?? undefined,
      viewed_at: undefined,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const _id = await ctx.db.insert("quotes", quote);
    const created = await ctx.db.get(_id);
    return created ?? quote;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    updates: v.object({
      title: v.optional(v.string()),
      project_type: v.optional(v.string()),
      status: v.optional(v.string()),
      contact_name: v.optional(v.string()),
      contact_email: v.optional(v.string()),
      cover_image_url: v.optional(v.string()),
      deposit_percentage: v.optional(v.number()),
      total_amount: v.optional(v.number()),
      accepted_at: v.optional(v.string()),
      accepted_by_name: v.optional(v.string()),
      valid_until: v.optional(v.string()),
      viewed_at: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const quote = await ctx.db
      .query("quotes")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!quote) {
      throw new Error("Quote not found");
    }
    if (quote.user_id !== userId) {
      throw new Error("Forbidden");
    }

    const updated = {
      ...quote,
      ...args.updates,
      updated_at: nowIso(),
    };

    await ctx.db.replace(quote._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const quote = await ctx.db
      .query("quotes")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!quote) return null;
    if (quote.user_id !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(quote._id);
    return quote._id;
  },
});

export const generateFromTranscript = action({
  args: {
    userId: v.optional(v.string()),
    transcript: v.string(),
    title: v.optional(v.string()),
    project_type: v.optional(v.string()),
    client_name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await getUserId(ctx, args.userId);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    const systemPrompt = [
      "You are generating client quotations for a New Zealand-based web design and digital consultancy called What The Heck.",
      "",
      "Your input will usually be a rough transcript from a client meeting or post-meeting voice note. These transcripts may be messy, informal, repetitive, or contain errors. Your job is to turn them into a clear, confident, client-ready written quote that explains both what will be done and why it matters.",
      "",
      "Tone & Voice",
      "- Professional, calm, and straight-talking",
      "- Confident but not salesy",
      "- Friendly and human, never corporate",
      "- Written in NZ English",
      "- No hype, no buzzwords, no filler",
      "- Avoid phrases like \"we're thrilled\", \"excited to\", \"cutting-edge\", \"best-in-class\"",
      "- Use hyphens only, never em dashes",
      "- Write as an experienced consultant who has done this many times before",
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
      "- Do not use hyphen-prefixed lines inside paragraph strings",
      "- Bullets must be plain strings without leading '-' or '*' characters",
      "- If you need subsection headings, use entries that start with \"HEADING:\" and follow with bullet items",
      "- If you need an extra paragraph inside a section, use entries that start with \"PARA:\"",
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
      "Optional",
      "- Aim for approximately 60 percent paragraph explanation and 40 percent bullet points",
    ].join("\n");

    const userPrompt = [
      "Client context:",
      `Client name: ${args.client_name ?? "Unknown"}`,
      `Proposed title (if provided): ${args.title ?? "Not provided"}`,
      `Project type (if provided): ${args.project_type ?? "Not provided"}`,
      "",
      "Transcript:",
      args.transcript,
      "",
      "Return JSON only with this exact shape:",
      "{",
      '  "title": string | null,',
      '  "project_type": string | null,',
      '  "intro": string[],',
      '  "approach": string[],',
      '  "scope": string[],',
      '  "not_included": string[],',
      '  "investment": string[],',
      '  "next_steps": string[],',
      '  "assumptions": string[],',
      '  "items": [{ "description": string, "quantity": number, "rate": number, "is_optional": boolean }]',
      "}",
      "",
      "Rules for JSON:",
      "- Use empty arrays when a section is not relevant",
      "- Do not include hyphen bullets inside strings",
      "- Use plain strings for bullets",
      "- Use \"HEADING:\" entries for subgroup headings (e.g., \"HEADING: Homepage\")",
      "- Use \"PARA:\" entries for extra explanatory paragraphs inside a section",
      "- Only include pricing in items/investment if it appears in the transcript",
      "- If pricing is unclear, leave items empty and note this in investment",
      "- Keep wording concise and NZ English",
    ].join("\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2-0905",
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("Failed to parse quote draft response");
    }

    const parsed = JSON.parse(content.slice(start, end + 1));
    const asArray = (value: unknown) => {
      if (Array.isArray(value)) {
        return value.filter((item) => typeof item === "string");
      }
      if (typeof value === "string" && value.trim().length > 0) {
        return [value.trim()];
      }
      return [];
    };

    const items = Array.isArray(parsed.items)
      ? parsed.items
          .map((item: any) => ({
            description: typeof item.description === "string" ? item.description : null,
            quantity: typeof item.quantity === "number" ? item.quantity : 1,
            rate: typeof item.rate === "number" ? item.rate : null,
            is_optional: Boolean(item.is_optional),
          }))
          .filter((item: any) => item.description && typeof item.rate === "number")
      : [];

    return {
      title: typeof parsed.title === "string" ? parsed.title : null,
      project_type: typeof parsed.project_type === "string" ? parsed.project_type : null,
      intro: asArray(parsed.intro),
      approach: asArray(parsed.approach),
      scope: asArray(parsed.scope),
      not_included: asArray(parsed.not_included),
      investment: asArray(parsed.investment),
      next_steps: asArray(parsed.next_steps),
      assumptions: asArray(parsed.assumptions),
      items,
    };
  },
});
