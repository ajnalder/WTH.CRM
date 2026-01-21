import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  parseCsvText,
  mapCsvRows,
  mapCollectionRows,
  CsvProductRow,
  CsvCollectionRow,
} from "@/utils/promoCsv";
import {
  buildCollectionRules,
  mapCollectionRuleRows,
  CollectionRule,
} from "@/utils/promoCollectionRules";
import { useToast } from "@/components/ui/use-toast";

const promoApi = api as any;

export default function PromoAdminImport() {
  const { toast } = useToast();
  const client = useQuery(promoApi.promoClients.getDefaultClient, {});
  const ensureDefaultClient = useMutation(promoApi.promoClients.ensureDefaultClient);
  const importCsvRows = useAction(promoApi.promoProducts.importCsv);
  const importCollections = useAction(promoApi.promoProducts.importCollections);
  const applyCollectionRules = useAction(promoApi.promoProducts.applyCollectionRules);
  const [rows, setRows] = useState<CsvProductRow[]>([]);
  const [rawCount, setRawCount] = useState(0);
  const [collectionRows, setCollectionRows] = useState<CsvCollectionRow[]>([]);
  const [collectionRawCount, setCollectionRawCount] = useState(0);
  const [ruleRows, setRuleRows] = useState<CollectionRule[]>([]);
  const [ruleRawCount, setRuleRawCount] = useState(0);
  const [ruleSkipped, setRuleSkipped] = useState<{ row: number; reason: string }[]>([]);
  const [result, setResult] = useState<any>(null);
  const [collectionResult, setCollectionResult] = useState<any>(null);
  const [rulesResult, setRulesResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [rulesLoading, setRulesLoading] = useState(false);

  const ready = rows.length > 0 && !!client;
  const collectionReady = collectionRows.length > 0 && !!client;
  const rulesReady = ruleRows.length > 0 && !!client;

  useEffect(() => {
    ensureDefaultClient().catch(() => null);
  }, [ensureDefaultClient]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseCsvText(text);
    setRawCount(Math.max(0, parsed.length - 1));
    const mapped = mapCsvRows(parsed);
    setRows(mapped);
    setResult(null);
  };

  const handleCollectionFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseCsvText(text);
    setCollectionRawCount(Math.max(0, parsed.length - 1));
    const mapped = mapCollectionRows(parsed);
    setCollectionRows(mapped);
    setCollectionResult(null);
  };

  const handleRulesFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseCsvText(text);
    setRuleRawCount(Math.max(0, parsed.length - 1));
    const mapped = mapCollectionRuleRows(parsed);
    const { rules, skipped } = buildCollectionRules(mapped);
    setRuleRows(rules);
    setRuleSkipped(skipped);
    setRulesResult(null);
  };

  const handleImport = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const summary = await importCsvRows({ clientId: client.id, rows });
      setResult(summary);
      toast({ title: "CSV import complete" });
    } catch (error: any) {
      toast({
        title: "CSV import failed",
        description: error.message ?? "Please retry.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionImport = async () => {
    if (!client) return;
    setCollectionLoading(true);
    try {
      const summary = await importCollections({ clientId: client.id, rows: collectionRows });
      setCollectionResult(summary);
      toast({ title: "Collection import complete" });
    } catch (error: any) {
      toast({
        title: "Collection import failed",
        description: error.message ?? "Please retry.",
        variant: "destructive",
      });
    } finally {
      setCollectionLoading(false);
    }
  };

  const skippedRows = useMemo(() => result?.skipped ?? [], [result]);
  const collectionSkippedRows = useMemo(() => collectionResult?.skipped ?? [], [collectionResult]);

  const handleApplyRules = async () => {
    if (!client) return;
    setRulesLoading(true);
    try {
      const summary = await applyCollectionRules({ clientId: client.id, rules: ruleRows });
      setRulesResult(summary);
      toast({ title: "Collection rules applied" });
    } catch (error: any) {
      toast({
        title: "Collection rules failed",
        description: error.message ?? "Please retry.",
        variant: "destructive",
      });
    } finally {
      setRulesLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Import Shopify Products</h1>
          <p className="text-sm text-muted-foreground">Upload Golf 360 CSV exports.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin">Back to dashboard</Link>
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">CSV file</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full text-sm"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {rows.length > 0
            ? `Mapped ${rows.length} products from ${rawCount} rows.`
            : rawCount > 0
            ? "No mappable rows found. Check headers or required fields."
            : "No file selected yet."}
        </div>
        <Button onClick={handleImport} disabled={!ready || loading}>
          {loading ? "Importing..." : "Import products"}
        </Button>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Collections CSV</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleCollectionFileChange}
            className="block w-full text-sm"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {collectionRows.length > 0
            ? `Mapped ${collectionRows.length} collection rows from ${collectionRawCount} rows.`
            : collectionRawCount > 0
            ? "No mappable rows found. Check headers."
            : "No file selected yet."}
        </div>
        <Button onClick={handleCollectionImport} disabled={!collectionReady || collectionLoading}>
          {collectionLoading ? "Importing..." : "Import collections"}
        </Button>
      </Card>

      {result && (
        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-medium">Import Summary</h2>
          <div className="text-sm text-muted-foreground">
            Created: {result.createdCount} | Updated: {result.updatedCount} | Skipped: {skippedRows.length}
          </div>
          {skippedRows.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Skipped rows</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {skippedRows.map((row: any) => (
                  <li key={`${row.row}-${row.reason}`}>
                    Row {row.row}: {row.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {collectionResult && (
        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-medium">Collection Import Summary</h2>
          <div className="text-sm text-muted-foreground">
            Updated: {collectionResult.updatedCount} | Skipped: {collectionSkippedRows.length}
          </div>
          {collectionSkippedRows.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Skipped rows</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {collectionSkippedRows.map((row: any) => (
                  <li key={`${row.row}-${row.reason}`}>
                    Row {row.row}: {row.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Collection rules CSV</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleRulesFileChange}
            className="block w-full text-sm"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {ruleRows.length > 0
            ? `Parsed ${ruleRows.length} rules from ${ruleRawCount} rows.`
            : ruleRawCount > 0
            ? "No rule rows parsed. Check headers."
            : "No file selected yet."}
        </div>
        {ruleSkipped.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Skipped {ruleSkipped.length} rows (manual or unsupported rules).
          </div>
        )}
        <Button onClick={handleApplyRules} disabled={!rulesReady || rulesLoading}>
          {rulesLoading ? "Applying rules..." : "Apply collection rules"}
        </Button>
      </Card>

      {rulesResult && (
        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-medium">Collection Rules Summary</h2>
          <div className="text-sm text-muted-foreground">
            Processed: {rulesResult.processedCount} | Updated: {rulesResult.updatedCount}
          </div>
          <div className="text-xs text-muted-foreground">
            Products with tags: {rulesResult.productsWithTags ?? 0} | HotDeals tag matches:{" "}
            {rulesResult.productsWithHotDealsTag ?? 0} | Products matching any rule:{" "}
            {rulesResult.productsMatchingAnyRule ?? 0} | Clearance matches:{" "}
            {rulesResult.clearanceMatches ?? 0}
          </div>
        </Card>
      )}
    </div>
  );
}
