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

function getKlaviyoReportingConfig(overrideMetricId?: string) {
  const conversionMetricId =
    overrideMetricId?.trim() || process.env.KLAVIYO_PLACED_ORDER_METRIC_ID;
  if (!conversionMetricId) {
    throw new Error("Missing KLAVIYO_PLACED_ORDER_METRIC_ID");
  }

  return { conversionMetricId };
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

async function klaviyoPost(
  path: string,
  body: unknown,
  options?: { authScheme?: "apiKey" | "bearer" },
) {
  const { apiKey, baseUrl, revision } = getKlaviyoConfig();
  const url = `${baseUrl}${path}`;
  const authScheme = options?.authScheme ?? "apiKey";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authScheme === "bearer" ? `Bearer ${apiKey}` : `Klaviyo-API-Key ${apiKey}`,
      Accept: "application/json",
      revision,
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Klaviyo error ${response.status}: ${text}`);
  }

  return JSON.parse(text);
}

async function klaviyoPatch(
  path: string,
  body: unknown,
  options?: { authScheme?: "apiKey" | "bearer" },
) {
  const { apiKey, baseUrl, revision } = getKlaviyoConfig();
  const url = `${baseUrl}${path}`;
  const authScheme = options?.authScheme ?? "apiKey";

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: authScheme === "bearer" ? `Bearer ${apiKey}` : `Klaviyo-API-Key ${apiKey}`,
      Accept: "application/json",
      revision,
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Klaviyo error ${response.status}: ${text}`);
  }

  return JSON.parse(text);
}

export type KlaviyoAudienceOption = { id: string; label?: string };

type KlaviyoCampaignDraftOptions = {
  audienceId?: string;
  subjectLine?: string;
  previewText?: string;
  fromEmail?: string;
  fromLabel?: string;
  audienceOptions?: KlaviyoAudienceOption[];
  defaultAudienceId?: string;
  templateId?: string;
  openingParagraph?: string;
};

export async function createKlaviyoCampaignDraft(
  name: string,
  options?: KlaviyoCampaignDraftOptions,
) {
  const audienceOptions = options?.audienceOptions ?? [];
  const selectedAudienceId =
    options?.audienceId?.trim() ||
    options?.defaultAudienceId?.trim() ||
    audienceOptions[0]?.id;
  if (!selectedAudienceId) {
    throw new Error("No Klaviyo audience ID available.");
  }

  const fromEmail = options?.fromEmail?.trim();
  if (!fromEmail) {
    throw new Error("Missing Klaviyo from email.");
  }
  const fromLabel = options?.fromLabel?.trim() || "Golf 360";
  const subjectLine = options?.subjectLine?.trim();
  const previewText = options?.previewText?.trim();
  if (!subjectLine || !previewText) {
    throw new Error("Missing subject line or preview text for the campaign message.");
  }

  const payload = {
    data: {
      type: "campaign",
      attributes: {
        name,
        audiences: {
          included: [selectedAudienceId],
        },
        "campaign-messages": {
          data: [
            {
              type: "campaign-message",
              attributes: {
                definition: {
                  channel: "email",
                  label: "Email",
                  content: {
                    subject: subjectLine,
                    preview_text: previewText,
                    from_email: fromEmail,
                    from_label: fromLabel,
                  },
                },
              },
            },
          ],
        },
        send_strategy: {
          method: "immediate",
        },
        send_options: {
          use_smart_sending: true,
        },
      },
    },
  };

  const data = await klaviyoPost("/api/campaigns", payload, { authScheme: "apiKey" });
  const campaignId = data?.data?.id as string | undefined;
  if (!campaignId) {
    throw new Error("Klaviyo campaign creation failed.");
  }

  // If a template ID is provided, fetch it and apply to the campaign message
  const templateId = options?.templateId?.trim();
  const openingParagraph = options?.openingParagraph?.trim();

  if (templateId) {
    // Get the campaign message ID from the response
    const messageData = data?.data?.relationships?.["campaign-messages"]?.data;
    const messageId = Array.isArray(messageData) ? messageData[0]?.id : messageData?.id;

    if (messageId) {
      // Fetch the template to get its HTML
      const templateData = await klaviyoGet(`/api/templates/${templateId}/`);
      let templateHtml = templateData?.data?.attributes?.html || "";

      // Replace the {{ opening_paragraph }} placeholder with actual content
      if (openingParagraph && templateHtml) {
        // Handle various placeholder formats
        templateHtml = templateHtml
          .replace(/\{\{\s*opening_paragraph\s*\}\}/gi, openingParagraph)
          .replace(/\{\%\s*opening_paragraph\s*\%\}/gi, openingParagraph);
      }

      // Assign template and set HTML content
      if (templateHtml) {
        // First, assign the template to the campaign message
        const assignPayload = {
          data: {
            type: "campaign-message-assign-template-action",
            id: messageId,
            relationships: {
              template: {
                data: {
                  type: "template",
                  id: templateId,
                },
              },
            },
          },
        };

        try {
          await klaviyoPost("/api/campaign-message-assign-template/", assignPayload);
        } catch (err) {
          // Template assignment might fail, continue anyway
          console.warn("Template assignment failed:", err);
        }

        // Then update the message content with our modified HTML
        const updatePayload = {
          data: {
            type: "campaign-message",
            id: messageId,
            attributes: {
              label: "Promo Email",
              content: {
                subject: subjectLine,
                preview_text: previewText,
                from_email: fromEmail,
                from_label: fromLabel,
              },
              body: {
                html: templateHtml,
              },
            },
          },
        };

        await klaviyoPatch(`/api/campaign-messages/${messageId}/`, updatePayload);
      }
    }
  }

  return { campaignId, openingParagraph };
}

function pickCampaignMessageId(campaign: KlaviyoCampaign | undefined) {
  const relationships = campaign?.relationships as any;
  const messages =
    relationships?.["campaign-messages"]?.data ??
    relationships?.campaign_messages?.data ??
    [];
  return messages?.[0]?.id as string | undefined;
}

export function getKlaviyoAudienceOptions(settings?: {
  klaviyo_audiences?: { id: string; label?: string }[] | null;
}) {
  return (
    settings?.klaviyo_audiences?.map((audience) => ({
      id: audience.id,
      label: audience.label || audience.id,
    })) ?? []
  );
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
  debug?: {
    path: string;
    status: number | null;
    ok: boolean;
    keys: string[];
  }[];
};

type KlaviyoReportResult = {
  groupings?: {
    campaign_id?: string;
    campaign_message_id?: string;
    send_channel?: string;
  };
  statistics?: Record<string, number>;
};

type KlaviyoResponse = {
  ok: boolean;
  status: number | null;
  data?: any;
};

async function klaviyoTryGet(path: string): Promise<KlaviyoResponse> {
  const { apiKey, baseUrl, revision } = getKlaviyoConfig();
  const url = `${baseUrl}${path}`;

  try {
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
      return { ok: false, status: response.status };
    }

    return { ok: true, status: response.status, data: JSON.parse(text) };
  } catch {
    return { ok: false, status: null };
  }
}

function buildTimeframe(sendDate?: string) {
  if (!sendDate) {
    return { key: "last_365_days" };
  }

  const sendTime = Date.parse(sendDate);
  if (!Number.isFinite(sendTime)) {
    return { key: "last_365_days" };
  }

  const start = new Date(sendTime - 1000 * 60 * 60 * 24);
  return {
    start: start.toISOString(),
    end: new Date().toISOString(),
  };
}

async function fetchCampaignValuesReport(
  campaignId: string,
  sendDate?: string,
  placedOrderMetricId?: string,
): Promise<KlaviyoMetricSnapshot> {
  const { conversionMetricId } = getKlaviyoReportingConfig(placedOrderMetricId);
  const payload = {
    data: {
      type: "campaign-values-report",
      attributes: {
        statistics: [
          "open_rate",
          "click_rate",
          "conversions",
          "conversion_value",
          "recipients",
        ],
        timeframe: buildTimeframe(sendDate),
        conversion_metric_id: conversionMetricId,
        group_by: ["campaign_id", "campaign_message_id", "send_channel"],
        filter: `and(equals(campaign_id,"${campaignId}"),equals(send_channel,"email"))`,
      },
    },
  };

  const data = await klaviyoPost("/api/campaign-values-reports", payload);
  const results = (data?.data?.attributes?.results as KlaviyoReportResult[]) || [];
  const matching = results.find((result) => result.groupings?.campaign_id === campaignId);
  const stats = matching?.statistics || {};

  return {
    openRate: stats.open_rate,
    clickRate: stats.click_rate,
    placedOrderCount: stats.conversions,
    placedOrderValue: stats.conversion_value,
    debug: [
      {
        path: "/api/campaign-values-reports",
        status: 200,
        ok: true,
        keys: Object.keys(stats).slice(0, 120),
      },
    ],
  };
}

async function fetchMessageMetrics(messageId: string): Promise<KlaviyoMetricSnapshot> {
  const paths = [
    `/api/campaign-messages/${messageId}`,
    `/api/campaign-messages/${messageId}/reporting`,
    `/api/campaign-message-analytics/${messageId}`,
    `/api/campaign-message-reports/${messageId}`,
  ];

  const debugEntries: {
    path: string;
    status: number | null;
    ok: boolean;
    keys: string[];
  }[] = [];
  for (const path of paths) {
    const response = await klaviyoTryGet(path);
    if (!response.ok || !response.data) {
      debugEntries.push({ path, status: response.status, ok: false, keys: [] });
      continue;
    }

    const { metrics, candidates } = extractMetrics(response.data);
    const keys = Object.keys(candidates).slice(0, 120);
    debugEntries.push({ path, status: response.status, ok: true, keys });

    if (
      metrics.openRate !== undefined ||
      metrics.clickRate !== undefined ||
      metrics.placedOrderValue !== undefined ||
      metrics.placedOrderCount !== undefined
    ) {
      return { ...metrics, debug: debugEntries };
    }
  }

  return {
    debug: debugEntries,
  };
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

export async function fetchCampaignResults(
  campaignId: string,
  options?: { placedOrderMetricId?: string },
) {
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
  let metrics: KlaviyoMetricSnapshot;
  try {
    metrics = await fetchCampaignValuesReport(
      campaign.id,
      sendDate,
      options?.placedOrderMetricId,
    );
  } catch (error) {
    if (isDev()) {
      console.warn("Klaviyo reporting API failed.", error);
    }
    metrics = await fetchMessageMetrics(messageId);
  }

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
    debug: metrics.debug,
  };
}
