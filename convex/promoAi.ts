"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./promoUtils";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = "moonshotai/kimi-k2";

function clampBullets(bullets: string[]) {
  const cleaned = bullets
    .map((bullet) => bullet.trim().replace(/^[-*\s]+/, ""))
    .filter(Boolean);
  if (cleaned.length !== 3) return [];
  return cleaned.map((bullet) => bullet.replace(/\s+/g, " ").trim());
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function stripHtml(input: string) {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function sentenceBullets(text: string) {
  if (!text) return [];
  const sentences = text
    .split(/[.!?]\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const bullets: string[] = [];
  for (const sentence of sentences) {
    if (bullets.length >= 3) break;
    const words = sentence.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    bullets.push(sentence);
  }
  return bullets;
}

function fallbackBullets(
  description: string | null | undefined,
  title?: string,
  vendor?: string,
  type?: string
) {
  const cleaned = description ? stripHtml(description) : "";
  const bullets = sentenceBullets(cleaned);
  if (bullets.length === 3) return bullets;

  const words = cleaned.split(/\s+/).filter(Boolean);
  const chunked: string[] = [];
  let index = 0;
  while (chunked.length < 3 && index < words.length) {
    const chunk = words.slice(index, index + 18).join(" ");
    if (chunk.trim()) chunked.push(chunk);
    index += 18;
  }
  if (chunked.length === 3) return chunked;

  const fallback = [title, vendor, type]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
  if (!fallback) return [];
  return Array.from({ length: 3 }, () => fallback);
}

async function requestBullets(description: string, apiKey: string) {
  const cleanedDescription = stripHtml(description);
  const body = {
    model: MODEL_NAME,
    temperature: 0.3,
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content:
          "You create concise marketing bullets for ecommerce products. Return JSON only.",
      },
      {
        role: "user",
        content: `Create exactly 3 bullet points from the product description below.\n\nRules:\n- Each bullet must be 15–18 words.\n- Start each bullet with a benefit-led phrase, not a sentence.\n- Focus on customer outcomes, not marketing hype.\n- Use plain NZ English.\n- No emojis.\n- No exaggerated claims.\n- Do not repeat the product name.\n- Do not mention “Kiwi” or location-specific language.\n- Avoid fluff words like “premium”, “ultimate”, “perfect”.\n- Bullets must be suitable for use in an EDM or Canva graphic.\n\nReturn JSON only with key \"bullets\".\n\nDescription:\n${cleanedDescription}`,
      },
    ],
    response_format: { type: "json_object" },
  };

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const message = data?.choices?.[0]?.message?.content ?? "";
  const parsed = safeJsonParse(message);
  const bullets = Array.isArray(parsed?.bullets) ? parsed.bullets : [];
  return clampBullets(bullets);
}

export const generateBulletsForProduct = action({
  args: { productId: v.string(), force: v.optional(v.boolean()) },
  handler: async (ctx, { productId, force }) => {
    await assertAdmin(ctx);

    const apiKey = process.env.CONVEX_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("Missing CONVEX_OPENROUTER_API_KEY");
    }

    const product = await ctx.runQuery("promoProducts:getProductById" as any, {
      productId,
    });

    if (!product) {
      throw new Error("Product not found.");
    }

    if (product.bullet_points?.length && !force) {
      return { ok: true, bullets: product.bullet_points };
    }

    if (!product.description) {
      const bullets = fallbackBullets("", product.title, product.vendor, product.product_type);
      if (bullets.length === 0) {
        throw new Error("No bullets generated.");
      }
      await ctx.runMutation("promoProducts:setProductBullets" as any, {
        productId,
        bullets,
      });
      return { ok: true, bullets };
    }

    const bullets = await requestBullets(product.description, apiKey);
    const resolvedBullets =
      bullets.length > 0
        ? bullets
        : fallbackBullets(product.description, product.title, product.vendor, product.product_type);
    if (resolvedBullets.length === 0) {
      throw new Error("No bullets generated.");
    }

    await ctx.runMutation("promoProducts:setProductBullets" as any, {
      productId,
      bullets: resolvedBullets,
    });

    return { ok: true, bullets: resolvedBullets };
  },
});

export const generateBulletsForPromotion = action({
  args: { promotionId: v.string(), force: v.optional(v.boolean()) },
  handler: async (ctx, { promotionId, force }) => {
    await assertAdmin(ctx);

    const apiKey = process.env.CONVEX_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("Missing CONVEX_OPENROUTER_API_KEY");
    }

    const promotionData = await ctx.runQuery(
      "promoPromotions:getPromotionForAdmin" as any,
      { promotionId }
    );

    if (!promotionData?.items) {
      throw new Error("Promotion not found.");
    }

    const results: { productId: string; bullets: string[]; status: string }[] = [];
    const errorDetails: { productId: string; status: string }[] = [];
    let generatedCount = 0;
    let skippedCount = 0;
    let missingDescriptionCount = 0;
    let errorCount = 0;

    for (const item of promotionData.items) {
      const product = item.product;
      if (!product) continue;
      if (product.bullet_points?.length && !force) {
        results.push({ productId: product.id, bullets: product.bullet_points, status: "skipped" });
        skippedCount += 1;
        continue;
      }
      if (!product.description) {
        const bullets = fallbackBullets("", product.title, product.vendor, product.product_type);
        if (bullets.length > 0) {
          await ctx.runMutation("promoProducts:setProductBullets" as any, {
            productId: product.id,
            bullets,
          });
          results.push({ productId: product.id, bullets, status: "generated" });
          generatedCount += 1;
        } else {
          results.push({ productId: product.id, bullets: [], status: "missing_description" });
          missingDescriptionCount += 1;
        }
        continue;
      }

      try {
        const bullets = await requestBullets(product.description, apiKey);
        const resolvedBullets =
          bullets.length > 0
            ? bullets
            : fallbackBullets(
                product.description,
                product.title,
                product.vendor,
                product.product_type
              );

        if (resolvedBullets.length > 0) {
          await ctx.runMutation("promoProducts:setProductBullets" as any, {
            productId: product.id,
            bullets: resolvedBullets,
          });
          results.push({ productId: product.id, bullets: resolvedBullets, status: "generated" });
          generatedCount += 1;
        } else {
          results.push({ productId: product.id, bullets: [], status: "empty" });
          errorCount += 1;
          errorDetails.push({ productId: product.id, status: "empty" });
        }
      } catch (error: any) {
        const status = error?.message ?? "error";
        results.push({ productId: product.id, bullets: [], status });
        errorCount += 1;
        errorDetails.push({ productId: product.id, status });
      }
    }

    return {
      ok: true,
      results,
      generatedCount,
      skippedCount,
      missingDescriptionCount,
      errorCount,
      errorDetails,
    };
  },
});
