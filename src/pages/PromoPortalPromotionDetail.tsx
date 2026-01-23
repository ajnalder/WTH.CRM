import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/utils/promoPricing";

const promoApi = api as any;

export default function PromoPortalPromotionDetail() {
  const { clientId, id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const returnUrl = searchParams.get("returnUrl") ?? "";
  const autoReturn = searchParams.get("autoReturn") === "1";

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
        <p className="text-sm text-muted-foreground">Loading promotion...</p>
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

  const { promotion, items } = promotionData;
  const canReturnToPicker = Boolean(returnUrl) && promotion.status === "draft";

  useEffect(() => {
    if (!canReturnToPicker || !autoReturn) return;
    const timer = window.setTimeout(() => {
      window.location.assign(returnUrl);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [autoReturn, canReturnToPicker, returnUrl]);

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{promotion.name}</h1>
            <p className="text-sm text-muted-foreground">Status: {promotion.status}</p>
          </div>
          <div className="flex items-center gap-2">
            {canReturnToPicker && (
              <Button onClick={() => window.location.assign(returnUrl)}>
                Continue to product picker
              </Button>
            )}
            {promotion.status !== "draft" && (
              <Button asChild variant="default">
                <Link to={`/p/${clientId}/promotions/${id}/results?token=${token}`}>
                  See results
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to={`/p/${clientId}?token=${token}`}>Back</Link>
            </Button>
          </div>
        </div>

        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-medium">Selected products</h2>
          <div className="space-y-3">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">No products added.</p>
            )}
            {items.map((item: any) => {
              const product = item.product;
              if (!product) return null;
              const promoPrice = item.promo_price ?? product.price;
              return (
                <div key={item.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.promo_type === "percent_off"
                          ? `${item.promo_value}% off`
                          : item.promo_type === "sale_price"
                          ? `Sale price ${formatPrice(promoPrice)}`
                          : "No promo"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{formatPrice(promoPrice)}</p>
                      {product.compare_at_price && product.compare_at_price > promoPrice && (
                        <p className="text-xs text-muted-foreground">
                          Was {formatPrice(product.compare_at_price)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
