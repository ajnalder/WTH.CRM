import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { assertAdmin, assertValidPortalToken, generateId, updateTimestamp } from "./promoUtils";
import { nowIso } from "./_utils";

const productRow = v.object({
  title: v.string(),
  shortTitle: v.optional(v.string()),
  handle: v.optional(v.string()),
  productUrl: v.string(),
  imageUrl: v.string(),
  price: v.number(),
  compareAtPrice: v.optional(v.number()),
  vendor: v.optional(v.string()),
  productType: v.optional(v.string()),
  tags: v.optional(v.string()),
  description: v.optional(v.string()),
  externalId: v.optional(v.string()),
});

const shopifyProductRow = v.object({
  externalId: v.string(),
  title: v.string(),
  shortTitle: v.optional(v.string()),
  handle: v.optional(v.string()),
  productUrl: v.string(),
  imageUrl: v.optional(v.string()),
  price: v.number(),
  compareAtPrice: v.optional(v.number()),
  vendor: v.optional(v.string()),
  productType: v.optional(v.string()),
  tags: v.optional(v.string()),
  description: v.optional(v.string()),
  collections: v.optional(v.array(v.string())),
  status: v.optional(v.string()),
});

export const importCsvRows = mutation({
  args: {
    clientId: v.string(),
    rows: v.array(productRow),
  },
  handler: async (ctx, { clientId, rows }) => {
    await assertAdmin(ctx);

    let createdCount = 0;
    let updatedCount = 0;
    const skipped: { row: number; reason: string }[] = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      if (!row.title || !row.productUrl || !row.imageUrl) {
        skipped.push({ row: index + 1, reason: "Missing title/product URL/image URL" });
        continue;
      }

      if (!Number.isFinite(row.price)) {
        skipped.push({ row: index + 1, reason: "Invalid price" });
        continue;
      }

      let existing = null;

      if (row.handle) {
        existing = await ctx.db
          .query("promo_products")
          .withIndex("by_client_handle", (q) =>
            q.eq("client_id", clientId).eq("handle", row.handle)
          )
          .first();
      }

      if (!existing) {
        existing = await ctx.db
          .query("promo_products")
          .withIndex("by_client_product_url", (q) =>
            q.eq("client_id", clientId).eq("product_url", row.productUrl)
          )
          .first();
      }

      const payload = {
        client_id: clientId,
        external_source: "csv",
        external_id: row.externalId,
        title: row.title,
        short_title: row.shortTitle,
        handle: row.handle,
        product_url: row.productUrl,
        image_url: row.imageUrl,
        price: row.price,
        compare_at_price: row.compareAtPrice,
        vendor: row.vendor,
        product_type: row.productType,
        tags: row.tags,
        description: row.description,
        status: "active",
      };

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...payload,
          ...updateTimestamp(),
        });
        updatedCount += 1;
      } else {
        await ctx.db.insert("promo_products", {
          id: generateId(),
          ...payload,
          created_at: nowIso(),
          updated_at: nowIso(),
        });
        createdCount += 1;
      }
    }

    return {
      createdCount,
      updatedCount,
      skipped,
    };
  },
});

export const upsertProductFromExtension = mutation({
  args: {
    clientId: v.string(),
    token: v.string(),
    product: v.object({
      title: v.string(),
      short_title: v.optional(v.string()),
      product_url: v.string(),
      image_url: v.optional(v.string()),
      price: v.number(),
      compare_at_price: v.optional(v.number()),
      vendor: v.optional(v.string()),
      product_type: v.optional(v.string()),
      tags: v.optional(v.string()),
      description: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { clientId, token, product }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const now = nowIso();
    const existing = await ctx.db
      .query("promo_products")
      .withIndex("by_client_product_url", (q) =>
        q.eq("client_id", clientId).eq("product_url", product.product_url)
      )
      .first();

    const payload = {
      client_id: clientId,
      external_source: "extension",
      external_id: product.product_url,
      title: product.title,
      short_title: product.short_title ?? undefined,
      product_url: product.product_url,
      image_url: product.image_url ?? "",
      price: product.price,
      compare_at_price: product.compare_at_price ?? undefined,
      vendor: product.vendor ?? undefined,
      product_type: product.product_type ?? undefined,
      tags: product.tags ?? undefined,
      description: product.description?.slice(0, 4000) ?? undefined,
      status: "active",
      updated_at: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return { ok: true, productId: existing.id };
    }

    const id = generateId();
    await ctx.db.insert("promo_products", {
      id,
      ...payload,
      created_at: now,
    });
    return { ok: true, productId: id };
  },
});

export const upsertShopifyProducts = mutation({
  args: {
    clientId: v.string(),
    products: v.array(shopifyProductRow),
  },
  handler: async (ctx, { clientId, products }) => {
    await assertAdmin(ctx);
    let createdCount = 0;
    let updatedCount = 0;

    for (const product of products) {
      const existing = await ctx.db
        .query("promo_products")
        .withIndex("by_client_external_id", (q) =>
          q.eq("client_id", clientId).eq("external_id", product.externalId)
        )
        .first();

      const payload = {
        client_id: clientId,
        external_source: "shopify_admin",
        external_id: product.externalId,
        title: product.title,
        short_title: product.shortTitle,
        handle: product.handle,
        product_url: product.productUrl,
        image_url: product.imageUrl ?? "",
        price: product.price,
        compare_at_price: product.compareAtPrice,
        vendor: product.vendor,
        product_type: product.productType,
        tags: product.tags,
        description: product.description,
        collections: product.collections,
        status: product.status ?? "active",
      };

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...payload,
          ...updateTimestamp(),
        });
        updatedCount += 1;
      } else {
        await ctx.db.insert("promo_products", {
          id: generateId(),
          ...payload,
          created_at: nowIso(),
          updated_at: nowIso(),
        });
        createdCount += 1;
      }
    }

    return { createdCount, updatedCount };
  },
});

// Internal version for use from actions (portal sync) - no auth check
export const upsertShopifyProductsInternal = internalMutation({
  args: {
    clientId: v.string(),
    products: v.array(shopifyProductRow),
  },
  handler: async (ctx, { clientId, products }) => {
    let createdCount = 0;
    let updatedCount = 0;

    for (const product of products) {
      const existing = await ctx.db
        .query("promo_products")
        .withIndex("by_client_external_id", (q) =>
          q.eq("client_id", clientId).eq("external_id", product.externalId)
        )
        .first();

      const payload = {
        client_id: clientId,
        external_source: "shopify_admin",
        external_id: product.externalId,
        title: product.title,
        short_title: product.shortTitle,
        handle: product.handle,
        product_url: product.productUrl,
        image_url: product.imageUrl ?? "",
        price: product.price,
        compare_at_price: product.compareAtPrice,
        vendor: product.vendor,
        product_type: product.productType,
        tags: product.tags,
        description: product.description,
        collections: product.collections,
        status: product.status ?? "active",
      };

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...payload,
          ...updateTimestamp(),
        });
        updatedCount += 1;
      } else {
        await ctx.db.insert("promo_products", {
          id: generateId(),
          ...payload,
          created_at: nowIso(),
          updated_at: nowIso(),
        });
        createdCount += 1;
      }
    }

    return { createdCount, updatedCount };
  },
});

export const importCsv = action({
  args: {
    clientId: v.string(),
    rows: v.array(productRow),
  },
  handler: async (ctx, { clientId, rows }) => {
    await assertAdmin(ctx);

    const chunkSize = 200;
    let createdCount = 0;
    let updatedCount = 0;
    const skipped: { row: number; reason: string }[] = [];

    for (let start = 0; start < rows.length; start += chunkSize) {
      const chunk = rows.slice(start, start + chunkSize);
      const result = await ctx.runMutation(
        "promoProducts:importCsvRows" as any,
        { clientId, rows: chunk }
      );
      createdCount += result.createdCount;
      updatedCount += result.updatedCount;
      result.skipped.forEach((entry: { row: number; reason: string }) => {
        skipped.push({ row: entry.row + start, reason: entry.reason });
      });
    }

    return { createdCount, updatedCount, skipped };
  },
});

export const searchProducts = query({
  args: {
    clientId: v.string(),
    token: v.string(),
    search: v.optional(v.string()),
    vendor: v.optional(v.string()),
    productType: v.optional(v.string()),
    collection: v.optional(v.string()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { clientId, token, search, vendor, productType, collection, cursor, limit }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const normalizedSearch = search?.trim();
    const numItems = limit ?? 40;
    const products = await ctx.db
      .query("promo_products")
      .withIndex("by_client", (q) => q.eq("client_id", clientId))
      .take(5000);

    let filtered = products;
    if (normalizedSearch) {
      const needle = normalizedSearch.toLowerCase();
      filtered = filtered.filter((item) => item.title.toLowerCase().includes(needle));
    }
    if (vendor) {
      filtered = filtered.filter((item) => item.vendor === vendor);
    }
    if (productType) {
      filtered = filtered.filter((item) => item.product_type === productType);
    }
    if (collection) {
      filtered = filtered.filter((item) => item.collections?.includes(collection));
    }

    return {
      page: filtered.slice(0, numItems),
      isDone: true,
      continueCursor: null,
    };
  },
});

export const listFilters = query({
  args: { clientId: v.string(), token: v.string() },
  handler: async (ctx, { clientId, token }) => {
    await assertValidPortalToken(ctx, clientId, token);

    const items = await ctx.db
      .query("promo_products")
      .withIndex("by_client", (q) => q.eq("client_id", clientId))
      .take(1000);

    const vendors = new Set<string>();
    const productTypes = new Set<string>();
    const collections = new Set<string>();

    for (const item of items) {
      if (item.vendor) vendors.add(item.vendor);
      if (item.product_type) productTypes.add(item.product_type);
      item.collections?.forEach((collection) => collections.add(collection));
    }

    return {
      vendors: Array.from(vendors).sort(),
      productTypes: Array.from(productTypes).sort(),
      collections: Array.from(collections).sort(),
    };
  },
});

export const listProductsPage = query({
  args: {
    clientId: v.string(),
    cursor: v.union(v.string(), v.null()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { clientId, cursor, limit }) => {
    await assertAdmin(ctx);
    const numItems = limit ?? 200;
    return ctx.db
      .query("promo_products")
      .withIndex("by_client", (q) => q.eq("client_id", clientId))
      .paginate({ cursor: cursor ?? null, numItems });
  },
});

export const getProductById = query({
  args: { productId: v.string() },
  handler: async (ctx, { productId }) => {
    await assertAdmin(ctx);
    return ctx.db
      .query("promo_products")
      .withIndex("by_public_id", (q) => q.eq("id", productId))
      .first();
  },
});

export const setProductBullets = mutation({
  args: { productId: v.string(), bullets: v.array(v.string()) },
  handler: async (ctx, { productId, bullets }) => {
    await assertAdmin(ctx);
    const product = await ctx.db
      .query("promo_products")
      .withIndex("by_public_id", (q) => q.eq("id", productId))
      .first();

    if (!product) {
      throw new Error("Product not found.");
    }

    await ctx.db.patch(product._id, {
      bullet_points: bullets,
      updated_at: nowIso(),
    });

    return { ok: true };
  },
});

export const applyCollectionUpdates = mutation({
  args: {
    updates: v.array(
      v.object({
        productId: v.string(),
        collections: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, { updates }) => {
    await assertAdmin(ctx);
    for (const update of updates) {
      const product = await ctx.db
        .query("promo_products")
        .withIndex("by_public_id", (q) => q.eq("id", update.productId))
        .first();

      if (!product) continue;

      await ctx.db.patch(product._id, {
        collections: update.collections,
        updated_at: nowIso(),
      });
    }
    return { ok: true };
  },
});

export const applyCollectionRules = action({
  args: {
    clientId: v.string(),
    rules: v.array(
      v.object({
        collection: v.string(),
        mode: v.string(),
        conditions: v.array(
          v.object({
            field: v.string(),
            op: v.string(),
            value: v.optional(v.string()),
            numberValue: v.optional(v.number()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { clientId, rules }) => {
    await assertAdmin(ctx);

    const normalizedRules = rules.map((rule) => ({
      collection: rule.collection,
      mode: rule.mode === "any" ? "any" : "all",
      conditions: rule.conditions,
    }));

    const normalize = (value?: string | null) =>
      value?.trim().toLowerCase() ?? "";

    const normalizeTag = (value?: string | null) =>
      normalize(value).replace(/[^a-z0-9]+/g, "");

    const splitTags = (tags?: string | null) => {
      if (!tags) return [] as string[];
      return tags
        .split(/[,;|/]/)
        .map((tag) => normalizeTag(tag))
        .filter(Boolean);
    };

    const matchesCondition = (product: any, condition: any) => {
      const field = condition.field;
      const op = condition.op;
      const value = normalize(condition.value);

      if (field === "tag") {
        const tags = splitTags(product.tags);
        const target = normalizeTag(condition.value);
        const flatTags = normalizeTag(product.tags);
        if (op === "eq") return tags.includes(target) || flatTags.includes(target);
        if (op === "neq") return !tags.includes(target) && !flatTags.includes(target);
        return false;
      }

      if (field === "title") {
        const title = normalize(product.title);
        if (op === "contains") return title.includes(value);
        if (op === "eq") return title === value;
        if (op === "neq") return title !== value;
        return false;
      }

      if (field === "vendor") {
        const vendor = normalize(product.vendor);
        if (op === "eq") return vendor === value;
        if (op === "contains") return vendor.includes(value);
        if (op === "not_contains") return !vendor.includes(value);
        if (op === "neq") return vendor !== value;
        return false;
      }

      if (field === "productType") {
        const productType = normalize(product.product_type);
        if (op === "eq") return productType === value;
        if (op === "contains") return productType.includes(value);
        if (op === "not_contains") return !productType.includes(value);
        if (op === "neq") return productType !== value;
        return false;
      }

      if (field === "price") {
        const price = product.price ?? 0;
        if (op === "gt" && typeof condition.numberValue === "number") {
          return price > condition.numberValue;
        }
        if (op === "lt" && typeof condition.numberValue === "number") {
          return price < condition.numberValue;
        }
        if (op === "not_reduced") {
          return !(product.compare_at_price && product.compare_at_price > price);
        }
      }

      return false;
    };

    const matchesRule = (product: any, rule: any) => {
      if (!rule.conditions.length) return false;
      const results = rule.conditions.map((condition: any) =>
        matchesCondition(product, condition)
      );
      if (rule.mode === "any") return results.some(Boolean);
      return results.every(Boolean);
    };

    let cursor: string | null = null;
    let updatedCount = 0;
    let processedCount = 0;
    let productsWithTags = 0;
    let productsWithHotDealsTag = 0;
    let productsMatchingAnyRule = 0;
    let clearanceMatches = 0;

    const clearanceRule =
      normalizedRules.find(
        (rule) => normalize(rule.collection) === "clearance"
      ) ?? null;

    while (true) {
      const page: any = await ctx.runQuery("promoProducts:listProductsPage" as any, {
        clientId,
        cursor,
        limit: 200,
      });

      const updates: { productId: string; collections: string[] }[] = [];

      for (const product of page.page) {
        processedCount += 1;
        if (product.tags) {
          productsWithTags += 1;
          const flatTags = normalizeTag(product.tags);
          if (flatTags.includes("hotdeals")) {
            productsWithHotDealsTag += 1;
          }
        }
        const matchingRules = normalizedRules.filter((rule) =>
          matchesRule(product, rule)
        );
        if (matchingRules.length > 0) {
          productsMatchingAnyRule += 1;
        }
        if (clearanceRule && matchesRule(product, clearanceRule)) {
          clearanceMatches += 1;
        }

        const collections = matchingRules.map((rule) => rule.collection);

        const existing = (product.collections ?? []).slice().sort();
        const next = collections.slice().sort();
        if (existing.join("|") !== next.join("|")) {
          updates.push({ productId: product.id, collections: next });
        }
      }

      if (updates.length > 0) {
        await ctx.runMutation("promoProducts:applyCollectionUpdates" as any, {
          updates,
        });
        updatedCount += updates.length;
      }

      if (page.isDone) break;
      cursor = page.continueCursor;
    }

    return {
      ok: true,
      updatedCount,
      processedCount,
      productsWithTags,
      productsWithHotDealsTag,
      productsMatchingAnyRule,
      clearanceMatches,
    };
  },
});

export const importCollectionRows = mutation({
  args: {
    clientId: v.string(),
    rows: v.array(v.object({ collection: v.string(), title: v.string() })),
  },
  handler: async (ctx, { clientId, rows }) => {
    await assertAdmin(ctx);

    let updatedCount = 0;
    const skipped: { row: number; reason: string }[] = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const collection = row.collection.trim();
      const title = row.title.trim();

      if (!collection || !title) {
        skipped.push({ row: index + 1, reason: "Missing collection or title" });
        continue;
      }

      let product = await ctx.db
        .query("promo_products")
        .withIndex("by_client_title", (q) => q.eq("client_id", clientId).eq("title", title))
        .first();

      if (!product) {
        const searchResult = await ctx.db
          .query("promo_products")
          .withSearchIndex("search_title", (q) =>
            q.search("title", title).eq("client_id", clientId)
          )
          .paginate({ cursor: null, numItems: 5 });

        product =
          searchResult.page.find(
            (item) => item.title.toLowerCase() === title.toLowerCase()
          ) ?? null;
      }

      if (!product) {
        skipped.push({ row: index + 1, reason: "Product title not found" });
        continue;
      }

      const existingCollections = product.collections ?? [];
      if (!existingCollections.includes(collection)) {
        await ctx.db.patch(product._id, {
          collections: [...existingCollections, collection],
          updated_at: nowIso(),
        });
      }

      updatedCount += 1;
    }

    return { updatedCount, skipped };
  },
});

export const importCollections = action({
  args: {
    clientId: v.string(),
    rows: v.array(v.object({ collection: v.string(), title: v.string() })),
  },
  handler: async (ctx, { clientId, rows }) => {
    await assertAdmin(ctx);

    const chunkSize = 300;
    let updatedCount = 0;
    const skipped: { row: number; reason: string }[] = [];

    for (let start = 0; start < rows.length; start += chunkSize) {
      const chunk = rows.slice(start, start + chunkSize);
      const result = await ctx.runMutation(
        "promoProducts:importCollectionRows" as any,
        { clientId, rows: chunk }
      );

      updatedCount += result.updatedCount;
      result.skipped.forEach((entry: { row: number; reason: string }) => {
        skipped.push({ row: entry.row + start, reason: entry.reason });
      });
    }

    return { updatedCount, skipped };
  },
});
