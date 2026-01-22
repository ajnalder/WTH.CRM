import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const promoApi = api as any;

export default function PromoAdminDashboard() {
  const { toast } = useToast();
  const promotions = useQuery(promoApi.promoPromotions.listIncomingPromotionsForAdmin, {});
  const incoming = useMemo(() => promotions ?? [], [promotions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create EDM</h1>
          <p className="text-sm text-muted-foreground">
            Incoming promotions from client portals
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/import">Import CSV</Link>
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-medium">Incoming promotions</h2>
        {promotions ? (
          <div className="space-y-2">
            {incoming.length === 0 && (
              <p className="text-sm text-muted-foreground">No promotions yet.</p>
            )}
            {incoming.map((promo: any) => (
              <Link
                key={promo.id}
                to={`/admin/promotions/${promo.id}`}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium">{promo.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {promo.client_name} · Status: {promo.status}
                  </p>
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
