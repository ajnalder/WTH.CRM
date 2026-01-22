import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const promoApi = api as any;

export default function PromoAdminDashboard() {
  const { toast } = useToast();
  const [portalTokens, setPortalTokens] = useState<Record<string, string>>({});
  const [selectedPromoClientId, setSelectedPromoClientId] = useState("");
  const [linkSelections, setLinkSelections] = useState<Record<string, string>>({});

  const crmClients = useQuery(promoApi.promoClients.listCrmClientsForPromo, {});
  const promoClients = useQuery(promoApi.promoClients.listPromoClientsForAdmin, {});
  const ensurePromoClientForCrm = useMutation(promoApi.promoClients.ensurePromoClientForCrm);
  const linkPromoClientToCrm = useMutation(promoApi.promoClients.linkPromoClientToCrm);
  const promotions = useQuery(
    promoApi.promoPromotions.listPromotionsForAdmin,
    selectedPromoClientId ? { clientId: selectedPromoClientId } : "skip"
  );
  const generatePortalToken = useAction(promoApi.promoClients.generatePortalToken);
  const rotatePortalToken = useAction(promoApi.promoClients.rotatePortalToken);

  const enabledPromoClients = useMemo(
    () => (crmClients ?? []).filter((entry: any) => entry.promoClient),
    [crmClients]
  );

  useEffect(() => {
    if (!selectedPromoClientId && enabledPromoClients.length > 0) {
      setSelectedPromoClientId(enabledPromoClients[0].promoClient.id);
    }
  }, [enabledPromoClients, selectedPromoClientId]);

  const portalLink = useMemo(() => {
    if (!selectedPromoClientId) return "";
    const token = portalTokens[selectedPromoClientId];
    if (!token) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/p/${selectedPromoClientId}?token=${token}`;
  }, [portalTokens, selectedPromoClientId]);

  const handleGenerate = async (promoClientId: string) => {
    try {
      const result = await generatePortalToken({ clientId: promoClientId });
      setPortalTokens((prev) => ({ ...prev, [promoClientId]: result.token }));
      toast({ title: "Portal link generated", description: "Copy it below." });
    } catch (error: any) {
      toast({
        title: "Portal link generation failed",
        description: error.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRotate = async (promoClientId: string) => {
    try {
      const result = await rotatePortalToken({ clientId: promoClientId });
      setPortalTokens((prev) => ({ ...prev, [promoClientId]: result.token }));
      toast({ title: "Portal link rotated", description: "New token generated." });
    } catch (error: any) {
      toast({
        title: "Portal link rotation failed",
        description: error.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyPortalLink = async (promoClientId: string) => {
    const token = portalTokens[promoClientId];
    if (!token) return;
    const baseUrl = window.location.origin;
    await navigator.clipboard.writeText(`${baseUrl}/p/${promoClientId}?token=${token}`);
    toast({ title: "Portal link copied" });
  };

  const handleEnablePromoClient = async (crmClientId: string) => {
    try {
      const promoClient = await ensurePromoClientForCrm({ crmClientId });
      if (promoClient?.id && !selectedPromoClientId) {
        setSelectedPromoClientId(promoClient.id);
      }
      toast({ title: "Promo portal enabled" });
    } catch (error: any) {
      toast({
        title: "Failed to enable promo portal",
        description: error.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLinkPromoClient = async (crmClientId: string) => {
    const promoClientId = linkSelections[crmClientId];
    if (!promoClientId) return;
    try {
      await linkPromoClientToCrm({ crmClientId, promoClientId });
      toast({ title: "Data source linked" });
      if (!selectedPromoClientId) {
        setSelectedPromoClientId(promoClientId);
      }
    } catch (error: any) {
      toast({
        title: "Failed to link data source",
        description: error.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">EDM Promo Builder</h1>
          <p className="text-sm text-muted-foreground">Admin workspace for promo clients</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/import">Import CSV</Link>
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-medium">Promo clients</h2>
        {crmClients ? (
          <div className="space-y-3">
            {crmClients.length === 0 && (
              <p className="text-sm text-muted-foreground">No CRM clients yet.</p>
            )}
            {crmClients.map((entry: any) => {
              const promoClient = entry.promoClient;
              const token = promoClient ? portalTokens[promoClient.id] : null;
              const availableSources =
                promoClients?.filter((client: any) => !client.crm_client_id) ?? [];
              return (
                <div key={entry.crmClient.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{entry.crmClient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {promoClient
                          ? `Promo portal enabled. ${promoClient.product_count ?? 0} products loaded.`
                          : "Promo portal not enabled yet."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {promoClient ? (
                        <>
                          {promoClient.portal_token_hash ? (
                            <Button onClick={() => handleRotate(promoClient.id)}>
                              Rotate portal link
                            </Button>
                          ) : (
                            <Button onClick={() => handleGenerate(promoClient.id)}>
                              Generate portal link
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => handleCopyPortalLink(promoClient.id)}
                            disabled={!token}
                          >
                            Copy portal link
                          </Button>
                        </>
                      ) : (
                        <>
                          {availableSources.length > 0 && (
                            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                              <Select
                                value={linkSelections[entry.crmClient.id] ?? ""}
                                onValueChange={(value) =>
                                  setLinkSelections((prev) => ({
                                    ...prev,
                                    [entry.crmClient.id]: value,
                                  }))
                                }
                              >
                                <SelectTrigger className="w-full md:w-56">
                                  <SelectValue placeholder="Link existing data" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableSources.map((client: any) => (
                                    <SelectItem key={client.id} value={client.id}>
                                      {client.name} ({client.product_count} products)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                onClick={() => handleLinkPromoClient(entry.crmClient.id)}
                                disabled={!linkSelections[entry.crmClient.id]}
                              >
                                Link data
                              </Button>
                            </div>
                          )}
                          <Button onClick={() => handleEnablePromoClient(entry.crmClient.id)}>
                            Enable promo portal
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {promoClient && (
                    <div className="rounded-md border bg-muted p-3 text-sm break-all">
                      {token
                        ? `${window.location.origin}/p/${promoClient.id}?token=${token}`
                        : "No visible portal link yet."}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading clients...</p>
        )}
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-medium">Promotions</h2>
          <Select
            value={selectedPromoClientId}
            onValueChange={setSelectedPromoClientId}
            disabled={enabledPromoClients.length === 0}
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select promo client" />
            </SelectTrigger>
            <SelectContent>
              {enabledPromoClients.map((entry: any) => (
                <SelectItem key={entry.promoClient.id} value={entry.promoClient.id}>
                  {entry.crmClient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedPromoClientId ? (
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
            Select a promo client to view promotions.
          </p>
        )}
      </Card>
    </div>
  );
}
