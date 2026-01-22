import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useClients } from "@/hooks/useClients";
import {
  buildCollectionRules,
  mapCollectionRuleRows,
  CollectionRule,
} from "@/utils/promoCollectionRules";
import {
  CsvCollectionRow,
  CsvProductRow,
  mapCollectionRows,
  mapCsvRows,
  parseCsvText,
} from "@/utils/promoCsv";

const promoApi = api as any;

type ClientKlaviyoTabProps = {
  client: {
    id: string;
    company: string;
    klaviyo_from_email?: string | null;
    klaviyo_from_label?: string | null;
    klaviyo_default_audience_id?: string | null;
    klaviyo_audiences?: { id: string; label?: string }[] | null;
    klaviyo_placed_order_metric_id?: string | null;
  };
};

const emptyAudience = { id: "", label: "" };

export default function ClientKlaviyoTab({ client }: ClientKlaviyoTabProps) {
  const { toast } = useToast();
  const { updateClient } = useClients();
  const [portalTokens, setPortalTokens] = useState<Record<string, string>>({});
  const [linkSelection, setLinkSelection] = useState("");
  const [migrateSelection, setMigrateSelection] = useState("");
  const [isBackfilling, setIsBackfilling] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    klaviyo_from_email: client.klaviyo_from_email || "",
    klaviyo_from_label: client.klaviyo_from_label || "",
    klaviyo_default_audience_id: client.klaviyo_default_audience_id || "",
    klaviyo_placed_order_metric_id: client.klaviyo_placed_order_metric_id || "",
  });
  const [audiences, setAudiences] = useState<{ id: string; label: string }[]>(
    client.klaviyo_audiences?.map((audience) => ({
      id: audience.id,
      label: audience.label || "",
    })) || [emptyAudience]
  );

  const crmClients = useQuery(promoApi.promoClients.listCrmClientsForPromo, {});
  const promoClients = useQuery(promoApi.promoClients.listPromoClientsForAdmin, {});
  const ensurePromoClientForCrm = useMutation(promoApi.promoClients.ensurePromoClientForCrm);
  const linkPromoClientToCrm = useMutation(promoApi.promoClients.linkPromoClientToCrm);
  const migratePromoClientData = useMutation(promoApi.promoClients.migratePromoClientData);
  const backfillKlaviyoSettings = useMutation(
    promoApi.promoClients.backfillKlaviyoSettingsToClient
  );
  const generatePortalToken = useAction(promoApi.promoClients.generatePortalToken);
  const rotatePortalToken = useAction(promoApi.promoClients.rotatePortalToken);

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

  useEffect(() => {
    setSettingsForm({
      klaviyo_from_email: client.klaviyo_from_email || "",
      klaviyo_from_label: client.klaviyo_from_label || "",
      klaviyo_default_audience_id: client.klaviyo_default_audience_id || "",
      klaviyo_placed_order_metric_id: client.klaviyo_placed_order_metric_id || "",
    });
    setAudiences(
      client.klaviyo_audiences?.map((audience) => ({
        id: audience.id,
        label: audience.label || "",
      })) || [emptyAudience]
    );
  }, [client]);

  const promoEntry = useMemo(() => {
    return (crmClients ?? []).find((entry: any) => entry.crmClient.id === client.id) ?? null;
  }, [crmClients, client.id]);

  const promoClient = promoEntry?.promoClient ?? null;
  const promoClientId = promoClient?.id ?? "";

  const promotions = useQuery(
    promoApi.promoPromotions.listPromotionsForAdmin,
    promoClientId ? { clientId: promoClientId } : "skip"
  );

  const availableSources = useMemo(() => {
    return (promoClients ?? []).filter((item: any) => !item.crm_client_id);
  }, [promoClients]);

  const availableDataSources = useMemo(() => {
    return (promoClients ?? []).filter(
      (item: any) => item.id !== promoClient?.id && item.product_count > 0
    );
  }, [promoClients, promoClient?.id]);

  const portalLink = useMemo(() => {
    if (!promoClientId) return "";
    const token = portalTokens[promoClientId];
    if (!token) return "";
    return `${window.location.origin}/p/${promoClientId}?token=${token}`;
  }, [promoClientId, portalTokens]);

  const handleUpdateSettings = async () => {
    const cleanedAudiences = audiences
      .map((audience) => ({
        id: audience.id.trim(),
        label: audience.label.trim() || undefined,
      }))
      .filter((audience) => audience.id);

    await updateClient({
      id: client.id,
      updates: {
        klaviyo_from_email: settingsForm.klaviyo_from_email.trim() || undefined,
        klaviyo_from_label: settingsForm.klaviyo_from_label.trim() || undefined,
        klaviyo_default_audience_id:
          settingsForm.klaviyo_default_audience_id.trim() || undefined,
        klaviyo_placed_order_metric_id:
          settingsForm.klaviyo_placed_order_metric_id.trim() || undefined,
        klaviyo_audiences: cleanedAudiences,
      },
    });
  };

  const handleBackfillSettings = async () => {
    setIsBackfilling(true);
    try {
      const result = await backfillKlaviyoSettings({ crmClientId: client.id });
      if (!result?.ok) {
        toast({
          title: "No settings to import",
          description: result?.reason ?? "Company settings not found.",
        });
        return;
      }
      toast({ title: "Klaviyo settings imported" });
    } catch (error: any) {
      toast({
        title: "Failed to import settings",
        description: error.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBackfilling(false);
    }
  };

  const handleEnablePromoClient = async () => {
    try {
      await ensurePromoClientForCrm({ crmClientId: client.id });
      toast({ title: "Promo portal enabled" });
    } catch (error: any) {
      toast({
        title: "Failed to enable promo portal",
        description: error.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    if (!promoClientId) return;
    const result = await generatePortalToken({ clientId: promoClientId });
    setPortalTokens((prev) => ({ ...prev, [promoClientId]: result.token }));
  };

  const handleRotate = async () => {
    if (!promoClientId) return;
    const result = await rotatePortalToken({ clientId: promoClientId });
    setPortalTokens((prev) => ({ ...prev, [promoClientId]: result.token }));
  };

  const handleCopyPortalLink = async () => {
    if (!portalLink) return;
    await navigator.clipboard.writeText(portalLink);
    toast({ title: "Portal link copied" });
  };

  const handleLinkData = async () => {
    if (!linkSelection) return;
    await linkPromoClientToCrm({ crmClientId: client.id, promoClientId: linkSelection });
    setLinkSelection("");
    toast({ title: "Data source linked" });
  };

  const handleMoveData = async () => {
    if (!promoClientId || !migrateSelection) return;
    const result = await migratePromoClientData({
      crmClientId: client.id,
      fromPromoClientId: migrateSelection,
      toPromoClientId: promoClientId,
    });
    toast({
      title: "Data moved",
      description: `Moved ${result?.movedProducts ?? 0} products.`,
    });
    setMigrateSelection("");
  };

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
    if (!promoClientId) return;
    setLoading(true);
    try {
      const summary = await importCsvRows({ clientId: promoClientId, rows });
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
    if (!promoClientId) return;
    setCollectionLoading(true);
    try {
      const summary = await importCollections({ clientId: promoClientId, rows: collectionRows });
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

  const handleApplyRules = async () => {
    if (!promoClientId) return;
    setRulesLoading(true);
    try {
      const summary = await applyCollectionRules({ clientId: promoClientId, rules: ruleRows });
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
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-medium">Promo portal</h2>
        {promoClient ? (
          <>
            <p className="text-sm text-muted-foreground">
              Promo portal enabled. {promoClient.product_count ?? 0} products loaded.
            </p>
            <div className="flex flex-wrap gap-2">
              {promoClient.portal_token_hash ? (
                <Button onClick={handleRotate}>Rotate portal link</Button>
              ) : (
                <Button onClick={handleGenerate}>Generate portal link</Button>
              )}
              <Button variant="outline" onClick={handleCopyPortalLink} disabled={!portalLink}>
                Copy portal link
              </Button>
              <Button asChild variant="outline" disabled={!portalTokens[promoClientId]}>
                <Link to={`/p/${promoClientId}?token=${portalTokens[promoClientId] ?? ""}`}>
                  Open portal
                </Link>
              </Button>
            </div>
            <div className="rounded-md border bg-muted p-3 text-sm break-all">
              {portalLink || "No visible portal link yet."}
            </div>
            {availableDataSources.length > 0 && (
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <Select value={migrateSelection} onValueChange={setMigrateSelection}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Move data from" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDataSources.map((source: any) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name} ({source.product_count} products)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleMoveData} disabled={!migrateSelection}>
                  Move data
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Promo portal not enabled yet for this client.
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSources.length > 0 && (
                <>
                  <Select value={linkSelection} onValueChange={setLinkSelection}>
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue placeholder="Link existing data" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSources.map((source: any) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name} ({source.product_count} products)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleLinkData} disabled={!linkSelection}>
                    Link data
                  </Button>
                </>
              )}
              <Button onClick={handleEnablePromoClient}>Enable promo portal</Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-medium">Klaviyo settings</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleBackfillSettings} disabled={isBackfilling}>
            {isBackfilling ? "Importing..." : "Import existing settings"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Copies settings from the old global configuration into this client.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="klaviyo_from_email">From email</Label>
            <Input
              id="klaviyo_from_email"
              value={settingsForm.klaviyo_from_email}
              onChange={(event) =>
                setSettingsForm((prev) => ({
                  ...prev,
                  klaviyo_from_email: event.target.value,
                }))
              }
              placeholder="edm@golf360.co.nz"
            />
          </div>
          <div>
            <Label htmlFor="klaviyo_from_label">From label</Label>
            <Input
              id="klaviyo_from_label"
              value={settingsForm.klaviyo_from_label}
              onChange={(event) =>
                setSettingsForm((prev) => ({
                  ...prev,
                  klaviyo_from_label: event.target.value,
                }))
              }
              placeholder="Golf 360"
            />
          </div>
          <div>
            <Label htmlFor="klaviyo_default_audience_id">Default audience</Label>
            <Select
              value={settingsForm.klaviyo_default_audience_id}
              onValueChange={(value) =>
                setSettingsForm((prev) => ({
                  ...prev,
                  klaviyo_default_audience_id: value,
                }))
              }
              disabled={audiences.filter((audience) => audience.id.trim()).length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default audience" />
              </SelectTrigger>
              <SelectContent>
                {audiences
                  .filter((audience) => audience.id.trim())
                  .map((audience, index) => (
                    <SelectItem key={`${audience.id}-${index}`} value={audience.id}>
                      {audience.label || audience.id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="klaviyo_placed_order_metric_id">Placed order metric ID</Label>
            <Input
              id="klaviyo_placed_order_metric_id"
              value={settingsForm.klaviyo_placed_order_metric_id}
              onChange={(event) =>
                setSettingsForm((prev) => ({
                  ...prev,
                  klaviyo_placed_order_metric_id: event.target.value,
                }))
              }
              placeholder="RESQ6t"
            />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Audiences</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudiences((prev) => [...prev, emptyAudience])}
            >
              Add audience
            </Button>
          </div>
          <div className="space-y-3">
            {audiences.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add at least one audience to enable Klaviyo creation.
              </p>
            )}
            {audiences.map((audience, index) => (
              <div key={`audience-${index}`} className="grid gap-2 md:grid-cols-3">
                <Input
                  value={audience.label}
                  onChange={(event) => {
                    const next = [...audiences];
                    next[index] = { ...next[index], label: event.target.value };
                    setAudiences(next);
                  }}
                  placeholder="Audience name"
                />
                <Input
                  value={audience.id}
                  onChange={(event) => {
                    const next = [...audiences];
                    next[index] = { ...next[index], id: event.target.value };
                    setAudiences(next);
                  }}
                  placeholder="Audience ID"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    setAudiences((prev) => prev.filter((_, idx) => idx !== index))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleUpdateSettings}>Save Klaviyo settings</Button>
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-medium">Shopify data import</h2>
        <p className="text-sm text-muted-foreground">
          Upload product and collection CSV files to enable product selection.
        </p>
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
        <Button onClick={handleImport} disabled={!promoClientId || rows.length === 0 || loading}>
          {loading ? "Importing..." : "Import products"}
        </Button>

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
        <Button
          onClick={handleCollectionImport}
          disabled={!promoClientId || collectionRows.length === 0 || collectionLoading}
        >
          {collectionLoading ? "Importing..." : "Import collections"}
        </Button>

        <div className="space-y-2">
          <label className="text-sm font-medium">Collection Rules CSV</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleRulesFileChange}
            className="block w-full text-sm"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {ruleRows.length > 0
            ? `Mapped ${ruleRows.length} rules from ${ruleRawCount} rows.`
            : ruleRawCount > 0
            ? "No mappable rows found. Check headers."
            : "No file selected yet."}
        </div>
        {ruleSkipped.length > 0 && (
          <div className="rounded-md border bg-muted p-3 text-xs text-muted-foreground">
            {ruleSkipped.map((skip) => (
              <div key={`${skip.row}-${skip.reason}`}>
                Row {skip.row}: {skip.reason}
              </div>
            ))}
          </div>
        )}
        <Button
          onClick={handleApplyRules}
          disabled={!promoClientId || ruleRows.length === 0 || rulesLoading}
        >
          {rulesLoading ? "Applying..." : "Apply collection rules"}
        </Button>
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-medium">Promotions</h2>
        {promoClientId ? (
          promotions ? (
            <div className="space-y-2">
              {promotions.length === 0 && (
                <p className="text-sm text-muted-foreground">No promotions yet.</p>
              )}
              {promotions.map((promo: any) => (
                <Link
                  key={promo.id}
                  to={`/admin/promotions/${promo.id}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
                >
                  <div>
                    <p className="font-medium">{promo.name}</p>
                    <p className="text-xs text-muted-foreground">Status: {promo.status}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {promo.submitted_at ? "Submitted" : "Draft"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading promotions...</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            Enable the promo portal to view promotions.
          </p>
        )}
      </Card>
    </div>
  );
}
