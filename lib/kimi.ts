type KimiCampaignPayload = {
  clientName: string;
  promotionName: string;
  noteToAndrew?: string;
  products: unknown[];
};

export type KimiCampaignResponse = {
  campaign: {
    campaign_title: string;
    subject_lines: string[];
    preview_texts: string[];
    opening_paragraph: string;
  };
  products: Array<{
    product_id: string;
    bullets: string[];
  }>;
};

const DEFAULT_KIMI_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

function isDev() {
  return process.env.NODE_ENV !== "production";
}

function getKimiConfig() {
  const endpoint = process.env.KIMI_API_URL || DEFAULT_KIMI_ENDPOINT;
  const apiKey = process.env.KIMI_API_KEY;
  const model = process.env.KIMI_MODEL;

  if (!apiKey) {
    throw new Error("Missing KIMI_API_KEY");
  }
  if (!model) {
    throw new Error("Missing KIMI_MODEL");
  }

  return { endpoint, apiKey, model };
}

function buildPrompt(payload: KimiCampaignPayload) {
  const productsJson = JSON.stringify(payload.products, null, 2);
  const clientName = payload.clientName.replace(/"/g, '\\"');
  const promotionName = payload.promotionName.replace(/"/g, '\\"');
  const note = (payload.noteToAndrew ?? "").replace(/"/g, '\\"');
  return `SYSTEM:
You are an ecommerce email copy assistant for a NZ golf retailer.
Write in NZ English. Use hyphens, not em dashes.
Be accurate: only use facts provided in the input.
Avoid hype and guarantees. No emojis.
Return only valid JSON that matches the schema.

USER:
Create campaign copy plus product bullets for an email promotion.

Rules for campaign copy:
- Provide 5 subject line options (max 45 characters each).
- Provide 5 preview text options (max 90 characters each).
- Provide 1 opening paragraph (35–60 words, friendly, simple, no fluff).
- Provide 1 campaign title for internal naming (short, clear, 3–7 words).
- The campaign title should be suitable for a Klaviyo campaign name (no emojis, no special characters).

Rules for product bullets:
- For each product, return exactly 3 bullet points.
- Each bullet must be 6–14 words.
- Start each bullet with a benefit-led phrase (not a full sentence).
- Focus on customer outcomes. Avoid “premium/ultimate/perfect”.
- Do not repeat the product name in bullets.
- Do not invent features, materials, technologies, inclusions, warranties, or specs.

Return JSON matching this schema EXACTLY:

{
  "campaign": {
    "campaign_title": string,
    "subject_lines": string[],
    "preview_texts": string[],
    "opening_paragraph": string
  },
  "products": [
    {
      "product_id": string,
      "bullets": string[]
    }
  ]
}

Input:
client_name: "${clientName}"
promotion_name: "${promotionName}"
note: "${note}"

products:
${productsJson}
`;
}

export async function requestKimiCampaignCopy(payload: KimiCampaignPayload) {
  const { endpoint, apiKey, model } = getKimiConfig();
  const prompt = buildPrompt(payload);

  const body = {
    model,
    temperature: 0.3,
    max_tokens: 1200,
    messages: [
      {
        role: "system",
        content:
          "You are a careful JSON generator. Return only valid JSON that matches the schema.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  };

  if (isDev()) {
    console.log("Kimi request", {
      endpoint,
      model,
      productCount: payload.products.length,
    });
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Kimi error ${response.status}: ${text}`);
  }

  if (isDev()) {
    console.log("Kimi response", text.slice(0, 2000));
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error("Kimi response was not valid JSON.");
  }

  const message = data?.choices?.[0]?.message?.content ?? "";
  if (!message) {
    throw new Error("Kimi response missing message content.");
  }

  try {
    return JSON.parse(message) as KimiCampaignResponse;
  } catch {
    const match = message.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as KimiCampaignResponse;
      } catch {
        throw new Error("Kimi message content was not valid JSON.");
      }
    }
    throw new Error("Kimi message content was not valid JSON.");
  }
}
