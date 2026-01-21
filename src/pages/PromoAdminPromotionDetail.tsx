import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAction, useQuery } from "convex/react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/utils/promoPricing";
import { normalizeImageUrl } from "@/utils/promoImages";
import { useToast } from "@/components/ui/use-toast";

const promoApi = api as any;

export default function PromoAdminPromotionDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [showPack, setShowPack] = useState(false);
  const [loadingPack, setLoadingPack] = useState(false);
  const [packBlocks, setPackBlocks] = useState<any[]>([]);

  const promotionData = useQuery(
    promoApi.promoPromotions.getPromotionForAdmin,
    id ? { promotionId: id } : "skip"
  );
  const generateCanvaPack = useAction(promoApi.promoPromotions.generateCanvaPackForAdmin);
  const packData = useQuery(
    promoApi.promoPromotions.getCanvaPackForAdmin,
    showPack && id ? { promotionId: id } : "skip"
  );

  const blocks = useMemo(
    () => (packBlocks.length ? packBlocks : packData?.blocks ?? []),
    [packBlocks, packData]
  );

  useEffect(() => {
    if (packData?.blocks?.length) {
      setPackBlocks(packData.blocks);
      setShowPack(true);
    }
  }, [packData?.blocks?.length]);

  const handleTogglePack = async () => {
    if (!id) return;
    if (showPack) {
      setShowPack(false);
      return;
    }
    setLoadingPack(true);
    try {
      const result = await generateCanvaPack({ promotionId: id });
      if (result?.blocks?.length) {
        setPackBlocks(result.blocks);
      }
      setShowPack(true);
    } catch (error: any) {
      toast({
        title: "Canva pack failed",
        description: error.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPack(false);
    }
  };

  if (!promotionData) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline">
          <Link to="/admin">Back</Link>
        </Button>
        <p className="text-sm text-muted-foreground">Loading promotion...</p>
      </div>
    );
  }

  if (!promotionData?.promotion) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline">
          <Link to="/admin">Back</Link>
        </Button>
        <p className="text-sm text-muted-foreground">Promotion not found.</p>
      </div>
    );
  }

  const { promotion, items } = promotionData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{promotion.name}</h1>
          <p className="text-sm text-muted-foreground">Status: {promotion.status}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin">Back</Link>
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Selected products</h2>
          <Button onClick={handleTogglePack} disabled={loadingPack}>
            {loadingPack
              ? "Generating Canva Pack..."
              : showPack
              ? "Hide Canva Pack"
              : packData?.blocks?.length
              ? "Regenerate Canva Pack"
              : "Generate Canva Pack"}
          </Button>
        </div>
        {promotion.note_to_andrew && (
          <p className="text-sm text-muted-foreground">
            Note to Andrew: {promotion.note_to_andrew}
          </p>
        )}
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No products added.</p>
          )}
          {items.map((item: any) => {
            const product = item.product;
            if (!product) return null;
            const promoPrice = item.promo_price ?? product.price;
            const hasWasPrice =
              typeof product.compare_at_price === "number" &&
              product.compare_at_price > promoPrice;
            return (
              <div key={item.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.promo_type === "percent_off"
                          ? `${item.promo_value}% off`
                          : item.promo_type === "sale_price"
                          ? "Sale price"
                          : hasWasPrice
                          ? "Sale price"
                          : "Regular price"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p>{formatPrice(promoPrice)}</p>
                    {hasWasPrice && (
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

      {showPack && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Canva Pack</h2>
          </div>
          {blocks.length === 0 && (
            <p className="text-sm text-muted-foreground">No blocks available yet.</p>
          )}
          <div className="space-y-3">
            {blocks.map((block: any) => (
              <div key={block.productId} className="rounded-md border p-3">
                <div className="grid gap-4 text-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  {block.imageUrl && (
                    <div className="flex items-start justify-center">
                      <img
                        src={normalizeImageUrl(block.imageUrl)}
                        alt="Product"
                        className="h-auto w-full max-w-[600px] rounded-md border object-contain"
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <strong>PRODUCT NAME</strong>
                      <p>{block.name}</p>
                    </div>
                    <div>
                      <strong>PRICE</strong>
                      <p>{block.price}</p>
                      {block.wasPrice && <p>Was {block.wasPrice}</p>}
                    </div>
                    {block.bullets?.length > 0 && (
                      <div>
                        <strong>BULLETS</strong>
                        <ul className="list-disc pl-5">
                          {block.bullets.map((bullet: string) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <strong>LINK</strong>
                      <p>{block.link}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
