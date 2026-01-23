import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
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

  const payload = await response.json();
  if (!response.ok || payload.errors) {
    const message =
      payload?.errors?.[0]?.message || payload?.errors?.[0]?.extensions?.code;
    throw new Error(message || "Shopify API error");
  }

  return payload.data;
}

export const syncShopifyProducts = action({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    await assertAdmin(ctx);

    const client = await ctx.runQuery(api.clients.getById, { id: clientId });
    if (!client) {
      throw new Error("Client not found");
    }

    const domain = client.shopify_domain;
    const token = client.shopify_admin_access_token;
    if (!domain || !token) {
      throw new Error("Missing Shopify domain or token");
    }

    const startedAt = nowIso();
    await ctx.runMutation(api.clients.update, {
      id: clientId,
      updates: {
        shopify_sync_status: "running",
        shopify_sync_error: "",
      },
    });

    const isInitialSync = !client.shopify_last_synced_at;
    const updatedAfter = client.shopify_last_synced_at;
    const query =
      updatedAfter && !isInitialSync
        ? `updated_at:>=${updatedAfter}`
        : undefined;

    let hasNextPage = true;
    let after: string | null = null;
    let totalProcessed = 0;
    let createdCount = 0;
    let updatedCount = 0;

    try {
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
            clientId,
            products,
          });
          createdCount += result.createdCount ?? 0;
          updatedCount += result.updatedCount ?? 0;
        }

        totalProcessed += products.length;
        hasNextPage = data.products.pageInfo.hasNextPage;
        after = data.products.pageInfo.endCursor;
      }

      await ctx.runMutation(api.clients.update, {
        id: clientId,
        updates: {
          shopify_sync_status: "ok",
          shopify_sync_error: "",
          shopify_last_synced_at: startedAt,
          shopify_product_count: isInitialSync
            ? totalProcessed
            : client.shopify_product_count,
        },
      });

      return { createdCount, updatedCount, totalProcessed };
    } catch (error: any) {
      await ctx.runMutation(api.clients.update, {
        id: clientId,
        updates: {
          shopify_sync_status: "error",
          shopify_sync_error: error?.message || "Shopify sync failed",
        },
      });
      throw error;
    }
  },
});
