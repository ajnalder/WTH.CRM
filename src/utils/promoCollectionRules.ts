export type CollectionRuleCondition = {
  field: "tag" | "title" | "vendor" | "productType" | "price";
  op: "eq" | "neq" | "contains" | "not_contains" | "gt" | "lt" | "not_reduced";
  value?: string;
  numberValue?: number;
};

export type CollectionRule = {
  collection: string;
  mode: "any" | "all";
  conditions: CollectionRuleCondition[];
};

export type CollectionRuleRow = {
  collection: string;
  conditions: string;
};

const headerMap: Record<string, keyof CollectionRuleRow> = {
  "collection title": "collection",
  "collection": "collection",
  "conditions": "conditions",
};

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePriceValue(value: string) {
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCondition(token: string): CollectionRuleCondition | null {
  const text = token.trim();

  const tagEq = text.match(/^Product tag = (.+)$/i);
  if (tagEq) return { field: "tag", op: "eq", value: tagEq[1].trim() };

  const tagNeq = text.match(/^Product tag does not equal (.+)$/i);
  if (tagNeq) return { field: "tag", op: "neq", value: tagNeq[1].trim() };

  const titleContains = text.match(/^Title contains (.+)$/i);
  if (titleContains) return { field: "title", op: "contains", value: titleContains[1].trim() };

  const vendorEq = text.match(/^Vendor = (.+)$/i);
  if (vendorEq) return { field: "vendor", op: "eq", value: vendorEq[1].trim() };

  const vendorNotContains = text.match(/^Vendor does not contain (.+)$/i);
  if (vendorNotContains)
    return { field: "vendor", op: "not_contains", value: vendorNotContains[1].trim() };

  const productTypeEq = text.match(/^Product type = (.+)$/i);
  if (productTypeEq)
    return { field: "productType", op: "eq", value: productTypeEq[1].trim() };

  const productTypeNeq = text.match(/^Product type does not equal (.+)$/i);
  if (productTypeNeq)
    return { field: "productType", op: "neq", value: productTypeNeq[1].trim() };

  const productTypeContains = text.match(/^Product type contains (.+)$/i);
  if (productTypeContains)
    return { field: "productType", op: "contains", value: productTypeContains[1].trim() };

  const productTypeNotContains = text.match(/^Product type does not contain (.+)$/i);
  if (productTypeNotContains)
    return { field: "productType", op: "not_contains", value: productTypeNotContains[1].trim() };

  const priceGt = text.match(/^Price > (.+)$/i);
  if (priceGt) {
    const value = parsePriceValue(priceGt[1]);
    if (value !== null) return { field: "price", op: "gt", numberValue: value };
  }

  const priceLt = text.match(/^Price < (.+)$/i);
  if (priceLt) {
    const value = parsePriceValue(priceLt[1]);
    if (value !== null) return { field: "price", op: "lt", numberValue: value };
  }

  const priceNotReduced = text.match(/^Price is not reduced$/i);
  if (priceNotReduced) return { field: "price", op: "not_reduced" };

  return null;
}

export function mapCollectionRuleRows(rawRows: string[][]) {
  if (rawRows.length === 0) return [] as CollectionRuleRow[];

  const headers = rawRows[0].map((header) => normalizeHeader(header));
  const mappedHeaders = headers.map((header) => headerMap[header]);

  const isSingleColumn =
    rawRows[0].length === 1 &&
    normalizeHeader(rawRows[0][0]).includes("collection title") &&
    normalizeHeader(rawRows[0][0]).includes("conditions");

  const rows: CollectionRuleRow[] = [];
  for (let i = 1; i < rawRows.length; i += 1) {
    const row = rawRows[i];
    const record: Partial<CollectionRuleRow> = {};

    if (isSingleColumn) {
      const rawLine = row[0] ?? "";
      const splitIndex = rawLine.indexOf(",");
      if (splitIndex > -1) {
        record.collection = rawLine.slice(0, splitIndex).trim();
        record.conditions = rawLine.slice(splitIndex + 1).trim();
      }
    } else {
      for (let index = 0; index < mappedHeaders.length; index += 1) {
        const key = mappedHeaders[index];
        if (!key) continue;
        const value = row[index]?.trim() ?? "";
        if (!value) continue;
        (record as any)[key] = value;
      }
    }

    if (record.collection && record.conditions) {
      rows.push(record as CollectionRuleRow);
    }
  }

  return rows;
}

export function buildCollectionRules(rows: CollectionRuleRow[]) {
  const rules: CollectionRule[] = [];
  const skipped: { row: number; reason: string }[] = [];

  rows.forEach((row, index) => {
    const rawConditions = row.conditions.trim();
    if (/Manual collection/i.test(rawConditions)) {
      skipped.push({ row: index + 2, reason: "Manual collection" });
      return;
    }

    let mode: "any" | "all" = "all";
    let conditionText = rawConditions;

    if (/Match ANY/i.test(conditionText)) {
      mode = "any";
      conditionText = conditionText.replace(/\(Match ANY\)/i, "").trim();
    } else if (conditionText.includes(" OR ") && !conditionText.includes(" AND ")) {
      mode = "any";
    }

    const separator = mode === "any" ? /\s+OR\s+/i : /\s+AND\s+/i;
    const tokens = conditionText.split(separator).map((token) => token.trim()).filter(Boolean);

    const parsed = tokens.map((token) => parseCondition(token));
    const conditions = parsed.filter(Boolean) as CollectionRuleCondition[];

    if (conditions.length === 0) {
      skipped.push({ row: index + 2, reason: "No valid conditions" });
      return;
    }

    if (conditions.length !== tokens.length) {
      skipped.push({ row: index + 2, reason: "Unsupported condition" });
      return;
    }

    rules.push({
      collection: row.collection.trim(),
      mode,
      conditions,
    });
  });

  return { rules, skipped };
}
