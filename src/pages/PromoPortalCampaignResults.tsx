import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { Mail } from "lucide-react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const promoApi = api as any;

const mockCampaigns = [
  {
    id: "campaign-1",
    name: "Hot Deals January",
    status: "Sent",
    sendDate: "2026-01-20T19:30:00+13:00",
    openRate: 47.91,
    clickRate: 2.66,
    placedOrderValue: 3522.97,
    placedOrderCount: 10,
  },
  {
    id: "campaign-2",
    name: "Get Some Balls",
    status: "Sent",
    sendDate: "2026-01-15T19:30:00+13:00",
    openRate: 51.51,
    clickRate: 2.31,
    placedOrderValue: 5324.15,
    placedOrderCount: 37,
  },
  {
    id: "campaign-3",
    name: "Tech Deals",
    status: "Sent",
    sendDate: "2026-01-09T19:30:00+13:00",
    openRate: 51.22,
    clickRate: 1.43,
    placedOrderValue: 4873.2,
    placedOrderCount: 35,
  },
  {
    id: "campaign-4",
    name: "Summer Golf Essentials",
    status: "Sent",
    sendDate: "2026-01-06T19:30:00+13:00",
    openRate: 52.59,
    clickRate: 1.85,
    placedOrderValue: 12193.37,
    placedOrderCount: 27,
  },
  {
    id: "campaign-5",
    name: "15% off last chance",
    status: "Sent",
    sendDate: "2025-12-30T19:30:00+13:00",
    openRate: 38.13,
    clickRate: 1.97,
    placedOrderValue: 4165.65,
    placedOrderCount: 33,
  },
];

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRate(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatCurrency(value: number) {
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
                Results are mocked for now and will connect to Klaviyo soon.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live soon
            </span>
          </div>

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
              {mockCampaigns.map((campaign) => (
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
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {campaign.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(campaign.sendDate)}
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      {formatRate(campaign.openRate)}
                    </p>
                    <p className="text-xs text-muted-foreground">Recipients</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      {formatRate(campaign.clickRate)}
                    </p>
                    <p className="text-xs text-muted-foreground">Recipients</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      {formatCurrency(campaign.placedOrderValue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.placedOrderCount} orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {mockCampaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(campaign.sendDate)}
                    </p>
                  </div>
                  <span className="ml-auto inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {campaign.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Open rate</p>
                    <p className="font-semibold">{formatRate(campaign.openRate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Click rate</p>
                    <p className="font-semibold">{formatRate(campaign.clickRate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="font-semibold">{campaign.placedOrderCount}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Placed order value</span>
                  <span className="font-semibold">
                    {formatCurrency(campaign.placedOrderValue)}
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
