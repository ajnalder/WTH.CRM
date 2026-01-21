export type CsvProductRow = {
  title: string;
  shortTitle?: string;
  handle?: string;
  productUrl: string;
  imageUrl: string;
  price: number;
  compareAtPrice?: number;
  vendor?: string;
  productType?: string;
  tags?: string;
  description?: string;
  externalId?: string;
};

export type CsvCollectionRow = {
  collection: string;
  title: string;
};

const headerMap: Record<string, keyof CsvProductRow> = {
  title: "title",
  name: "title",
  "product title": "title",
  "short title": "shortTitle",
  short_title: "shortTitle",
  handle: "handle",
  slug: "handle",
  "product url": "productUrl",
  product_url: "productUrl",
  url: "productUrl",
  link: "productUrl",
  "online store url": "productUrl",
  "store url": "productUrl",
  "image url": "imageUrl",
  image_url: "imageUrl",
  image: "imageUrl",
  "image src": "imageUrl",
  "variant image": "imageUrl",
  price: "price",
  "variant price": "price",
  "compare at price": "compareAtPrice",
  compare_at_price: "compareAtPrice",
  "compare price": "compareAtPrice",
  "variant compare at price": "compareAtPrice",
  vendor: "vendor",
  brand: "vendor",
  "product type": "productType",
  product_type: "productType",
  type: "productType",
  "product category": "productType",
  tags: "tags",
  tag: "tags",
  description: "description",
  "body html": "description",
  body: "description",
  id: "externalId",
  "product id": "externalId",
};

const collectionHeaderMap: Record<string, keyof CsvCollectionRow> = {
  "product collection": "collection",
  collection: "collection",
  "collection title": "collection",
  "product title": "title",
  title: "title",
};

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseCsvText(text: string) {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentField += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      currentRow.push(currentField);
      if (currentRow.some((value) => value.trim() !== "")) {
        rows.push(currentRow);
      }
      currentField = "";
      currentRow = [];
      continue;
    }

    currentField += char;
  }

  if (currentField.length || currentRow.length) {
    currentRow.push(currentField);
    if (currentRow.some((value) => value.trim() !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function parsePrice(raw: string) {
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function mapCsvRows(rawRows: string[][]) {
  if (rawRows.length === 0) return [] as CsvProductRow[];

  const headers = rawRows[0].map((header) => normalizeHeader(header));
  const mappedHeaders = headers.map((header) => headerMap[header]);

  const rows: CsvProductRow[] = [];
  for (let i = 1; i < rawRows.length; i += 1) {
    const row = rawRows[i];
    const record: Partial<CsvProductRow> = {};

    for (let index = 0; index < mappedHeaders.length; index += 1) {
      const key = mappedHeaders[index];
      if (!key) continue;
      const value = row[index]?.trim() ?? "";
      if (!value) continue;

      if (key === "price" || key === "compareAtPrice") {
        const parsed = parsePrice(value);
        if (parsed !== null) {
          (record as any)[key] = parsed;
        }
        continue;
      }

      (record as any)[key] = value;
    }

    if (record.title && typeof record.price === "number") {
      if (!record.productUrl && record.handle) {
        record.productUrl = `/products/${record.handle}`;
      }
      if (!record.productUrl) record.productUrl = "";
      if (!record.imageUrl) record.imageUrl = "";
      rows.push(record as CsvProductRow);
    }
  }

  return rows;
}

export function mapCollectionRows(rawRows: string[][]) {
  if (rawRows.length === 0) return [] as CsvCollectionRow[];

  const headers = rawRows[0].map((header) => normalizeHeader(header));
  const mappedHeaders = headers.map((header) => collectionHeaderMap[header]);

  const rows: CsvCollectionRow[] = [];
  for (let i = 1; i < rawRows.length; i += 1) {
    const row = rawRows[i];
    const record: Partial<CsvCollectionRow> = {};

    for (let index = 0; index < mappedHeaders.length; index += 1) {
      const key = mappedHeaders[index];
      if (!key) continue;
      const value = row[index]?.trim() ?? "";
      if (!value) continue;
      (record as any)[key] = value;
    }

    if (record.collection && record.title) {
      rows.push(record as CsvCollectionRow);
    }
  }

  return rows;
}
