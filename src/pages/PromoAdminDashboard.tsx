import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const promoApi = api as any;

export default function PromoAdminDashboard() {
  const { toast } = useToast();
  const [portalToken, setPortalToken] = useState<string | null>(null);

  const ensureDefaultClient = useMutation(promoApi.promoClients.ensureDefaultClient);
  const client = useQuery(promoApi.promoClients.getDefaultClient, {});
  const promotions = useQuery(
    promoApi.promoPromotions.listPromotionsForAdmin,
    client ? { clientId: client.id } : "skip"
  );
  const generatePortalToken = useAction(promoApi.promoClients.generatePortalToken);
  const rotatePortalToken = useAction(promoApi.promoClients.rotatePortalToken);

  useEffect(() => {
    ensureDefaultClient().catch(() => {
      toast({
        title: "Unable to seed Golf 360",
        description: "Check Convex auth or permissions.",
        variant: "destructive",
      });
    });
  }, [ensureDefaultClient, toast]);

  const portalLink = useMemo(() => {
    if (!client || !portalToken) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/p/${client.id}?token=${portalToken}`;
  }, [client, portalToken]);

  const handleGenerate = async () => {
    if (!client) return;
    try {
      const result = await generatePortalToken({ clientId: client.id });
      setPortalToken(result.token);
      toast({ title: "Portal link generated", description: "Copy it below." });
    } catch (error: any) {
      toast({
        title: "Portal link generation failed",
        description: error.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRotate = async () => {
    if (!client) return;
    try {
      const result = await rotatePortalToken({ clientId: client.id });
      setPortalToken(result.token);
      toast({ title: "Portal link rotated", description: "New token generated." });
    } catch (error: any) {
      toast({
        title: "Portal link rotation failed",
        description: error.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyPortalLink = async () => {
    if (!portalLink) return;
    await navigator.clipboard.writeText(portalLink);
    toast({ title: "Portal link copied" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">EDM Promo Builder</h1>
          <p className="text-sm text-muted-foreground">Admin workspace for Golf 360</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/import">Import CSV</Link>
          </Button>
          {client?.portal_token_hash ? (
            <Button onClick={handleRotate}>Rotate portal link</Button>
          ) : (
            <Button onClick={handleGenerate}>Generate portal link</Button>
          )}
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Scott's Portal Link</h2>
            <p className="text-sm text-muted-foreground">
              {client?.portal_token_hash
                ? "Token active. Rotate to issue a new link."
                : "Generate a token to issue the first link."}
            </p>
          </div>
          <Button variant="outline" onClick={handleCopyPortalLink} disabled={!portalLink}>
            Copy portal link
          </Button>
        </div>
        <div className="rounded-md border bg-muted p-3 text-sm break-all">
          {portalLink || "No visible portal link yet."}
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-medium">Promotions</h2>
        {promotions ? (
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
        )}
      </Card>
    </div>
  );
}
