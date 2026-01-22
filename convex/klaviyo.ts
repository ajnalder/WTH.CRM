import { nowIso } from "./_utils";

const DEFAULT_KLAVIYO_BASE = "https://a.klaviyo.com";
const DEFAULT_KLAVIYO_REVISION = "2026-01-15";

type KlaviyoCampaign = {
  id: string;
  attributes?: Record<string, any>;
  relationships?: Record<string, any>;
};

type KlaviyoCampaignMessage = {
  id: string;
  attributes?: Record<string, any>;
};

function isDev() {
  return process.env.NODE_ENV !== "production";
}

function getKlaviyoConfig() {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing KLAVIYO_PRIVATE_API_KEY");
  }

  return {
    apiKey,
    baseUrl: process.env.KLAVIYO_API_BASE || DEFAULT_KLAVIYO_BASE,
    revision: process.env.KLAVIYO_API_REVISION || DEFAULT_KLAVIYO_REVISION,
  };
}

async function klaviyoGet(path: string, params?: Record<string, string>) {
  const { apiKey, baseUrl, revision } = getKlaviyoConfig();
  const url = new URL(`${baseUrl}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      Accept: "application/json",
      revision,
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Klaviyo error ${response.status}: ${text}`);
  }

  return JSON.parse(text);
}

export async function fetchCampaign(campaignId: string) {
  const data = await klaviyoGet(`/api/campaigns/${campaignId}`, {
    include: "campaign-messages",
  });
  return data?.data as KlaviyoCampaign;
}

export async function fetchCampaignMessage(messageId: string) {
  const data = await klaviyoGet(`/api/campaign-messages/${messageId}`);
  return data?.data as KlaviyoCampaignMessage;
}

function pickNumber(attributes: Record<string, any> | undefined, keys: string[]) {
  if (!attributes) return undefined;
  for (const key of keys) {
    const value = attributes[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

function pickString(attributes: Record<string, any> | undefined, keys: string[]) {
  if (!attributes) return undefined;
  for (const key of keys) {
    const value = attributes[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return undefined;
}

function collectMetricCandidates(source: any, output: Record<string, number | string>) {
  if (!source || typeof source !== "object") return;
  const stack = [source];
  const seen = new Set<any>();

  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);

    for (const [key, value] of Object.entries(current)) {
      if (value && typeof value === "object") {
        stack.push(value);
      }

      if (typeof value === "number" && Number.isFinite(value)) {
        if (!output[key]) output[key] = value;
      } else if (typeof value === "string" && value.trim()) {
        if (!output[key]) output[key] = value.trim();
      }
    }
  }
}

function extractMetrics(data: any) {
  const candidates: Record<string, number | string> = {};
  collectMetricCandidates(data, candidates);

  const openRate = pickNumber(candidates as any, [
    "open_rate",
    "open_rate_unique",
    "unique_open_rate",
    "opens_rate",
    "openRate",
  ]);
  const clickRate = pickNumber(candidates as any, [
    "click_rate",
    "click_rate_unique",
    "unique_click_rate",
    "clicks_rate",
    "clickRate",
  ]);
  const placedOrderValue = pickNumber(candidates as any, [
    "placed_order_value",
    "placed_order_revenue",
    "conversion_value",
    "revenue",
    "order_value",
  ]);
  const placedOrderCount = pickNumber(candidates as any, [
    "placed_order_count",
    "placed_orders",
    "conversion_count",
    "orders",
    "order_count",
  ]);
  const sendDate = pickString(candidates as any, [
    "send_time",
    "send_date",
    "sent_at",
    "sendDate",
  ]);
  const status = pickString(candidates as any, ["status", "state"]);

  return {
    metrics: { openRate, clickRate, placedOrderValue, placedOrderCount, sendDate, status },
    candidates,
  };
}

type KlaviyoMetricSnapshot = {
  status?: string;
  sendDate?: string;
  openRate?: number;
  clickRate?: number;
  placedOrderValue?: number;
  placedOrderCount?: number;
};

async function fetchMessageMetrics(messageId: string): Promise<KlaviyoMetricSnapshot> {
  const paths = [
    `/api/campaign-messages/${messageId}`,
    `/api/campaign-messages/${messageId}/reporting`,
    `/api/campaign-message-analytics/${messageId}`,
    `/api/campaign-message-reports/${messageId}`,
  ];

  let lastError: Error | null = null;
  for (const path of paths) {
    try {
      const data = await klaviyoGet(path);
      const { metrics, candidates } = extractMetrics(data);
      if (isDev()) {
        console.log("Klaviyo metrics keys", path, Object.keys(candidates).slice(0, 80));
      }
      if (
        metrics.openRate !== undefined ||
        metrics.clickRate !== undefined ||
        metrics.placedOrderValue !== undefined ||
        metrics.placedOrderCount !== undefined
      ) {
        return metrics;
      }
    } catch (error: any) {
      lastError = error;
    }
  }

  if (lastError && isDev()) {
    console.warn("Klaviyo metrics fetch failed:", lastError.message);
  }

  return {};
}

function resolveMessageId(campaign: KlaviyoCampaign) {
  const relationships = campaign.relationships || {};
  const messageRelationship =
    relationships["campaign-messages"] || relationships["campaign_messages"];
  const data = messageRelationship?.data;
  if (Array.isArray(data) && data[0]?.id) return data[0].id as string;
  if (data?.id) return data.id as string;
  return undefined;
}

export async function fetchCampaignResults(campaignId: string) {
  const campaign = await fetchCampaign(campaignId);
  if (!campaign?.id) {
    throw new Error("Campaign not found.");
  }

  const campaignName = pickString(campaign.attributes, ["name", "title"]) || "Campaign";
  const status = pickString(campaign.attributes, ["status"]);
  const sendDate =
    pickString(campaign.attributes, ["send_time", "send_date", "sent_at"]) || undefined;

  const messageId = resolveMessageId(campaign);
  if (!messageId) {
    return {
      campaignId: campaign.id,
      name: campaignName,
      status,
      sendDate,
      openRate: undefined,
      clickRate: undefined,
      placedOrderValue: undefined,
      placedOrderCount: undefined,
      refreshedAt: nowIso(),
    };
  }

  const message = await fetchCampaignMessage(messageId);
  const messageAttrs = message?.attributes ?? {};
  const metrics = await fetchMessageMetrics(messageId);

  return {
    campaignId: campaign.id,
    name: campaignName,
    status: metrics.status || pickString(messageAttrs, ["status", "state"]) || status,
    sendDate:
      metrics.sendDate ||
      pickString(messageAttrs, ["send_time", "send_date", "sent_at"]) ||
      sendDate,
    openRate:
      metrics.openRate ||
      pickNumber(messageAttrs, ["open_rate", "open_rate_unique", "unique_open_rate"]),
    clickRate:
      metrics.clickRate ||
      pickNumber(messageAttrs, ["click_rate", "click_rate_unique", "unique_click_rate"]),
    placedOrderValue:
      metrics.placedOrderValue ||
      pickNumber(messageAttrs, [
        "placed_order_value",
        "placed_order_revenue",
        "conversion_value",
        "revenue",
      ]),
    placedOrderCount:
      metrics.placedOrderCount ||
      pickNumber(messageAttrs, [
        "placed_order_count",
        "placed_orders",
        "conversion_count",
        "orders",
      ]),
    refreshedAt: nowIso(),
  };
}
