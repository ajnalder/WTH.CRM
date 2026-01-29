import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAction, useQuery } from "convex/react";
import { Mail } from "lucide-react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const promoApi = api as any;

type CampaignResult = {
  id: string;
  name: string;
  status?: string;
  send_date?: string;
  open_rate?: number;
  click_rate?: number;
  placed_order_value?: number;
  placed_order_count?: number;
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRate(value?: number) {
  if (typeof value !== "number") return "—";
  const percent = value <= 1 ? value * 100 : value;
  return `${percent.toFixed(2)}%`;
}

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PromoPortalCampaignResults() {
  const { clientId, id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const hasAutoRefreshed = useRef(false);

  const validation = useQuery(
    promoApi.promoClients.validatePortalToken,
    clientId && token ? { clientId, token } : "skip"
  );

  const promotionData = useQuery(
    promoApi.promoPromotions.getPromotionForPortal,
    clientId && token && id && validation?.valid
      ? { clientId, token, promotionId: id }
      : "skip"
  );
  const resultsData = useQuery(
    promoApi.promoCampaignResults.getResultsForPortal,
    clientId && token && id && validation?.valid
      ? { clientId, token, promotionId: id }
      : "skip"
  );
  const refreshResults = useAction(promoApi.promoCampaignResults.refreshResultsForPortal);

  const handleRefresh = async (force = false) => {
    if (!clientId || !token || !id) return;
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      await refreshResults({
        clientId,
        token,
        promotionId: id,
        force,
      });
    } catch (error: any) {
      setRefreshError(error.message ?? "Failed to refresh results.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!clientId || !token || !id || !validation?.valid) return;
    if (hasAutoRefreshed.current) return;
    hasAutoRefreshed.current = true;
    handleRefresh(false);
  }, [clientId, token, id, validation?.valid]);

  if (!clientId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6 max-w-md text-center space-y-2">
          <h1 className="text-xl font-semibold">Missing portal token</h1>
          <p className="text-sm text-muted-foreground">Please use the portal link.</p>
        </Card>
      </div>
    );
  }

  if (validation && !validation.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6 max-w-md text-center space-y-2">
          <h1 className="text-xl font-semibold">Portal link expired</h1>
          <p className="text-sm text-muted-foreground">Please request a new link.</p>
        </Card>
      </div>
    );
  }

  if (!promotionData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Loading campaign results...</p>
      </div>
    );
  }

  if (!promotionData?.promotion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6 max-w-md text-center space-y-2">
          <h1 className="text-xl font-semibold">Promotion not found</h1>
          <p className="text-sm text-muted-foreground">Please check your link.</p>
        </Card>
      </div>
    );
  }

  const promotionName = promotionData.promotion.name;
  const campaigns = (resultsData?.results ?? []) as CampaignResult[];
  const refreshedAt = resultsData?.refreshedAt as string | null;
  const hasLinkedCampaign = !!promotionData.promotion.klaviyo_campaign_id;

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Campaign Results</h1>
            <p className="text-sm text-muted-foreground">{promotionName}</p>
          </div>
          <Button asChild variant="outline">
            <Link to={`/p/${clientId}/promotions/${id}?token=${token}`}>Back</Link>
          </Button>
        </div>

        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Recent campaigns</h2>
              <p className="text-sm text-muted-foreground">
                Results are read-only and pulled from Klaviyo.
              </p>
              {refreshedAt && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {formatDate(refreshedAt)}
                </p>
              )}
              {isRefreshing && (
                <p className="text-xs text-muted-foreground">Refreshing results…</p>
              )}
            </div>
          </div>
          {refreshError && (
            <p className="text-sm text-red-600">{refreshError}</p>
          )}
          {!hasLinkedCampaign && (
            <p className="text-sm text-muted-foreground">
              Campaign results are not linked yet. Ask Andrew to connect the Klaviyo
              campaign ID.
            </p>
          )}
          {hasLinkedCampaign && campaigns.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No results synced yet. We’ll update automatically when data is available.
            </p>
          )}

          <div className="hidden md:block">
            <div className="grid grid-cols-[minmax(0,2fr)_120px_140px_120px_120px_140px] gap-3 border-b px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Campaign</span>
              <span>Status</span>
              <span>Send date</span>
              <span>Open rate</span>
              <span>Click rate</span>
              <span>Placed order</span>
            </div>
            <div className="divide-y">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="grid grid-cols-[minmax(0,2fr)_120px_140px_120px_120px_140px] gap-3 px-3 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <div>
                      <p className="font-medium text-primary">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">Engaged segment</p>
                    </div>
                  </div>
                  <div>
                    {campaign.status ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {campaign.status}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(campaign.send_date)}
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      {formatRate(campaign.open_rate)}
                    </p>
                    <p className="text-xs text-muted-foreground">Open rate</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      {formatRate(campaign.click_rate)}
                    </p>
                    <p className="text-xs text-muted-foreground">Click rate</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      {formatCurrency(campaign.placed_order_value)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.placed_order_count ?? "—"} orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(campaign.send_date)}
                    </p>
                  </div>
                  {campaign.status ? (
                    <span className="ml-auto inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {campaign.status}
                    </span>
                  ) : (
                    <span className="ml-auto text-xs text-muted-foreground">—</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Open rate</p>
                    <p className="font-semibold">{formatRate(campaign.open_rate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Click rate</p>
                    <p className="font-semibold">{formatRate(campaign.click_rate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="font-semibold">
                      {campaign.placed_order_count ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Placed order value</span>
                  <span className="font-semibold">
                    {formatCurrency(campaign.placed_order_value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
