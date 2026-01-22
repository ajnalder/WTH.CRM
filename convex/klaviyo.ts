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

async function klaviyoGet(path: string) {
  const { apiKey, baseUrl, revision } = getKlaviyoConfig();
  const url = `${baseUrl}${path}`;

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
  const data = await klaviyoGet(`/api/campaigns/${campaignId}`);
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

  return {
    campaignId: campaign.id,
    name: campaignName,
    status: pickString(messageAttrs, ["status", "state"]) || status,
    sendDate:
      pickString(messageAttrs, ["send_time", "send_date", "sent_at"]) || sendDate,
    openRate: pickNumber(messageAttrs, [
      "open_rate",
      "open_rate_unique",
      "unique_open_rate",
    ]),
    clickRate: pickNumber(messageAttrs, [
      "click_rate",
      "click_rate_unique",
      "unique_click_rate",
    ]),
    placedOrderValue: pickNumber(messageAttrs, [
      "placed_order_value",
      "placed_order_revenue",
      "conversion_value",
      "revenue",
    ]),
    placedOrderCount: pickNumber(messageAttrs, [
      "placed_order_count",
      "placed_orders",
      "conversion_count",
      "orders",
    ]),
    refreshedAt: nowIso(),
  };
}
