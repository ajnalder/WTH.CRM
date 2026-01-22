import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/utils/promoPricing";
import { useToast } from "@/components/ui/use-toast";
import { PromoImage } from "@/components/promo/PromoImage";

const promoApi = api as any;

export default function PromoAdminPromotionDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [showPack, setShowPack] = useState(false);
  const [loadingPack, setLoadingPack] = useState(false);
  const [packBlocks, setPackBlocks] = useState<any[]>([]);
  const [packCampaign, setPackCampaign] = useState<any | null>(null);
  const [klaviyoCampaignId, setKlaviyoCampaignId] = useState("");

  const promotionData = useQuery(
    promoApi.promoPromotions.getPromotionForAdmin,
    id ? { promotionId: id } : "skip"
  );
  const generateCanvaPack = useAction(promoApi.promoPromotions.generateCanvaPackForAdmin);
  const saveKlaviyoCampaignId = useMutation(promoApi.promoPromotions.setKlaviyoCampaignId);
  const packData = useQuery(
    promoApi.promoPromotions.getCanvaPackForAdmin,
    id ? { promotionId: id } : "skip"
  );

  const blocks = useMemo(
    () => (packBlocks.length ? packBlocks : packData?.blocks ?? []),
    [packBlocks, packData]
  );
  const campaignCopy = packCampaign ?? packData?.campaign ?? promotionData?.promotion;
  const hasCampaignCopy =
    !!campaignCopy?.generated_campaign_title ||
    !!campaignCopy?.generated_opening_paragraph ||
    (campaignCopy?.generated_subject_lines?.length ?? 0) > 0 ||
    (campaignCopy?.generated_preview_texts?.length ?? 0) > 0;

  useEffect(() => {
    if (packData?.blocks?.length) {
      setPackBlocks(packData.blocks);
      setShowPack(true);
    }
    if (packData?.campaign) {
      setPackCampaign(packData.campaign);
    }
  }, [packData?.blocks?.length, packData?.campaign]);

  useEffect(() => {
    if (promotionData?.promotion?.klaviyo_campaign_id) {
      setKlaviyoCampaignId(promotionData.promotion.klaviyo_campaign_id);
    }
  }, [promotionData?.promotion?.klaviyo_campaign_id]);

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
      if (result?.campaign) {
        setPackCampaign(result.campaign);
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

  const handleSaveCampaignId = async () => {
    if (!id) return;
    try {
      await saveKlaviyoCampaignId({ promotionId: id, campaignId: klaviyoCampaignId });
      toast({
        title: "Klaviyo campaign linked",
        description: "Campaign ID saved for results tracking.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save campaign ID",
        description: error.message ?? "Please try again.",
        variant: "destructive",
      });
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
        <div className="rounded-md border bg-muted/30 p-3 space-y-2">
          <p className="text-sm font-medium">Klaviyo campaign ID</p>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              value={klaviyoCampaignId}
              onChange={(event) => setKlaviyoCampaignId(event.target.value)}
              placeholder="Paste campaign ID from Klaviyo"
            />
            <Button
              variant="outline"
              onClick={handleSaveCampaignId}
              disabled={!klaviyoCampaignId.trim()}
            >
              Save ID
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Results are read-only and synced from Klaviyo without modifying campaigns.
          </p>
        </div>
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
                    <PromoImage
                      src={product.image_url}
                      alt={product.title}
                      className="h-12 w-12 rounded object-cover"
                      decoding="async"
                      fallback={
                        <div className="flex h-12 w-12 items-center justify-center rounded border text-[10px] text-muted-foreground">
                          No image
                        </div>
                      }
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
          {hasCampaignCopy && (
            <div className="rounded-md border bg-white p-4 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">CAMPAIGN TITLE</p>
                <p>{campaignCopy?.generated_campaign_title}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  SUBJECT LINE OPTIONS
                </p>
                <ul className="list-disc pl-5">
                  {campaignCopy?.generated_subject_lines?.map((line: string) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  PREVIEW TEXT OPTIONS
                </p>
                <ul className="list-disc pl-5">
                  {campaignCopy?.generated_preview_texts?.map((line: string) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">OPENING PARAGRAPH</p>
                <p>{campaignCopy?.generated_opening_paragraph}</p>
              </div>
            </div>
          )}
          {!hasCampaignCopy && (
            <p className="text-sm text-muted-foreground">
              Campaign copy not generated yet. Click "Generate" to create it.
            </p>
          )}
          {blocks.length === 0 && (
            <p className="text-sm text-muted-foreground">No blocks available yet.</p>
          )}
          <div className="space-y-3">
            {blocks.map((block: any) => (
              <div key={block.productId} className="rounded-md border p-3">
                <div className="grid gap-4 text-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  {block.imageUrl && (
                    <div className="flex items-start justify-center">
                      <PromoImage
                        src={block.imageUrl}
                        alt="Product"
                        className="h-auto w-full max-w-[600px] rounded-md border object-contain"
                        decoding="async"
                        fallback={
                          <div className="flex h-40 w-full max-w-[600px] items-center justify-center rounded-md border text-xs text-muted-foreground">
                            No image
                          </div>
                        }
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
