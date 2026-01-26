import { v } from "convex/values";
import { action, internalAction, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { assertAdmin } from "./promoUtils";
import { nowIso } from "./_utils";

const SHOPIFY_API_VERSION = "2024-10";

const PRODUCTS_QUERY = `
  query Products($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      edges {
        cursor
        node {
          id
          title
          handle
          descriptionHtml
          vendor
          productType
          tags
          status
          onlineStoreUrl
          collections(first: 10) {
            nodes {
              title
            }
          }
          images(first: 1) {
            nodes {
              url
              altText
            }
          }
          variants(first: 1) {
            nodes {
              price
              compareAtPrice
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

function normalizeDomain(domain: string) {
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function stripHtml(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "").trim();
}

type ShopifyClientRecord = {
  id: string;
  shopify_domain?: string | null;
  shopify_admin_access_token?: string | null;
  shopify_last_synced_at?: string | null;
  shopify_product_count?: number | null;
};

type ShopifySyncResult = {
  createdCount: number;
  updatedCount: number;
  totalProcessed: number;
};

async function shopifyGraphql(domain: string, token: string, query: string, variables: any) {
  const url = `https://${normalizeDomain(domain)}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const raw = await response.text();
  let payload: any = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.errors?.[0]?.message ||
      payload?.errors?.[0]?.extensions?.code ||
      raw;
    throw new Error(`Shopify API ${response.status}: ${message || "Request failed"}`);
  }

  if (payload?.errors?.length) {
    const message = payload.errors.map((err: any) => err.message).join("; ");
    throw new Error(`Shopify API error: ${message || "Unknown error"}`);
  }

  return payload?.data;
}

async function syncClientProducts(
  ctx: any,
  client: ShopifyClientRecord
): Promise<ShopifySyncResult> {
  const domain = client.shopify_domain;
  const token = client.shopify_admin_access_token;
  if (!domain || !token) {
    throw new Error("Missing Shopify domain or token");
  }

  const startedAt = nowIso();
  await ctx.runMutation(internal.clients.updateShopifySyncMeta, {
    id: client.id,
    shopify_sync_status: "running",
    shopify_sync_error: "",
  });

  const isInitialSync = !client.shopify_last_synced_at;
  const updatedAfter = client.shopify_last_synced_at;
  const query =
    updatedAfter && !isInitialSync ? `updated_at:>=${updatedAfter}` : undefined;

  let hasNextPage = true;
  let after: string | null = null;
  let totalProcessed = 0;
  let createdCount = 0;
  let updatedCount = 0;

  while (hasNextPage) {
    const data = await shopifyGraphql(domain, token, PRODUCTS_QUERY, {
      first: 100,
      after,
      query,
    });

    const edges = data.products.edges ?? [];
    const products = edges.map((edge: any) => {
      const node = edge.node;
      const variant = node.variants?.nodes?.[0];
      const image = node.images?.nodes?.[0];
      const collections = node.collections?.nodes?.map((c: any) => c.title) ?? [];
      const price = variant?.price ? Number(variant.price) : 0;
      const compareAtPrice = variant?.compareAtPrice
        ? Number(variant.compareAtPrice)
        : undefined;
      const shortTitle =
        node.title && node.title.length > 60 ? node.title.slice(0, 60) : undefined;

      return {
        externalId: node.id,
        title: node.title,
        shortTitle,
        handle: node.handle,
        productUrl:
          node.onlineStoreUrl ||
          `https://${normalizeDomain(domain)}/products/${node.handle}`,
        imageUrl: image?.url,
        price,
        compareAtPrice,
        vendor: node.vendor || undefined,
        productType: node.productType || undefined,
        tags: Array.isArray(node.tags) ? node.tags.join(", ") : undefined,
        description: stripHtml(node.descriptionHtml),
        collections,
        status: node.status ? String(node.status).toLowerCase() : undefined,
      };
    });

    if (products.length > 0) {
      const result = await ctx.runMutation(api.promoProducts.upsertShopifyProducts, {
        clientId: client.id,
        products,
      });
      createdCount += result.createdCount ?? 0;
      updatedCount += result.updatedCount ?? 0;
    }

    totalProcessed += products.length;
    hasNextPage = data.products.pageInfo.hasNextPage;
    after = data.products.pageInfo.endCursor;
  }

      await ctx.runMutation(internal.clients.updateShopifySyncMeta, {
        id: client.id,
        shopify_sync_status: "ok",
        shopify_sync_error: "",
        shopify_last_synced_at: startedAt,
        shopify_product_count: isInitialSync
          ? totalProcessed
          : client.shopify_product_count,
      });

  return { createdCount, updatedCount, totalProcessed };
}

export const listShopifyClientsForSync = internalQuery({
  args: {},
  handler: async (ctx): Promise<ShopifyClientRecord[]> => {
    const clients = await ctx.db.query("clients").collect();
    return clients
      .filter((client) => client.shopify_domain && client.shopify_admin_access_token)
      .map((client) => ({
        id: client.id,
        shopify_domain: client.shopify_domain,
        shopify_admin_access_token: client.shopify_admin_access_token,
        shopify_last_synced_at: client.shopify_last_synced_at,
        shopify_product_count: client.shopify_product_count,
      }));
  },
});

export const syncShopifyProducts = action({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }): Promise<ShopifySyncResult> => {
    await assertAdmin(ctx);

    const client: ShopifyClientRecord | null = await ctx.runQuery(api.clients.getById, {
      id: clientId,
    });
    if (!client) {
      throw new Error("Client not found");
    }

    try {
      return await syncClientProducts(ctx, client);
    } catch (error: any) {
      await ctx.runMutation(internal.clients.updateShopifySyncMeta, {
        id: clientId,
        shopify_sync_status: "error",
        shopify_sync_error: error?.message || "Shopify sync failed",
      });
      throw error;
    }
  },
});

export const syncAllShopifyClients = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<Array<ShopifySyncResult & { clientId: string; ok: boolean; error?: string }>> => {
    const clients: ShopifyClientRecord[] = await ctx.runQuery(
      internal.shopify.listShopifyClientsForSync,
      {}
    );
    const results: Array<
      ShopifySyncResult & { clientId: string; ok: boolean; error?: string }
    > = [];
    for (const client of clients) {
      try {
        const result = await syncClientProducts(ctx, client);
        results.push({ clientId: client.id, ok: true, ...result });
      } catch (error: any) {
        await ctx.runMutation(internal.clients.updateShopifySyncMeta, {
          id: client.id,
          shopify_sync_status: "error",
          shopify_sync_error: error?.message || "Shopify sync failed",
        });
        results.push({
          clientId: client.id,
          ok: false,
          error: error?.message,
          createdCount: 0,
          updatedCount: 0,
          totalProcessed: 0,
        });
      }
    }
    return results;
  },
});
