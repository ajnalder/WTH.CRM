import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, computePromoPrice, formatSavings } from "@/utils/promoPricing";
import { PromoImage } from "@/components/promo/PromoImage";

const promoApi = api as any;

export default function PromoPortalNew() {
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const existingPromotionId = searchParams.get("promotionId");
  const returnUrl = searchParams.get("returnUrl") ?? "";

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [promotionId, setPromotionId] = useState<string | null>(
    existingPromotionId ?? null
  );

  // Sync promotionId state with URL param when it changes
  useEffect(() => {
    setPromotionId(existingPromotionId ?? null);
  }, [existingPromotionId]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [vendor, setVendor] = useState<string | undefined>(undefined);
  const [productType, setProductType] = useState<string | undefined>(undefined);
  const [collection, setCollection] = useState<string | undefined>(undefined);
  const [pageSize, setPageSize] = useState(40);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const lastLoadedCountRef = useRef(0);
  const isLoadingMoreRef = useRef(false);

  const validation = useQuery(
    promoApi.promoClients.validatePortalToken,
    clientId && token ? { clientId, token } : "skip"
  );

  const createPromotion = useMutation(promoApi.promoPromotions.createPromotion);
  const addPromotionItem = useMutation(promoApi.promoPromotions.addPromotionItem);
  const updatePromotionItem = useMutation(promoApi.promoPromotions.updatePromotionItem);
  const removePromotionItem = useMutation(promoApi.promoPromotions.removePromotionItem);
  const submitPromotion = useMutation(promoApi.promoPromotions.submitPromotion);
  const updatePromotionDetails = useMutation(promoApi.promoPromotions.updatePromotionDetails);

  const promotionData = useQuery(
    promoApi.promoPromotions.getPromotionForPortal,
    clientId && token && promotionId ? { clientId, token, promotionId } : "skip"
  );

  const filters = useQuery(
    promoApi.promoProducts.listFilters,
    clientId && token && validation?.valid ? { clientId, token } : "skip"
  );

  const products = useQuery(
    promoApi.promoProducts.searchProducts,
    clientId && token && validation?.valid
      ? {
          clientId,
          token,
          search: debouncedSearch,
          vendor,
          productType,
          collection,
          limit: pageSize,
        }
      : "skip"
  );

  const [cachedProducts, setCachedProducts] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const productsPage = products?.page ?? cachedProducts;

  const syncShopify = useAction(promoApi.shopify.syncShopifyProductsForPortal);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPageSize(40);
    lastLoadedCountRef.current = 0;
    isLoadingMoreRef.current = false;
    setCachedProducts([]);
  }, [debouncedSearch, vendor, productType, collection]);

  useEffect(() => {
    if (products?.page) {
      setCachedProducts(products.page);
    }
  }, [products?.page]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (!productsPage.length) return;
        if (isLoadingMoreRef.current) return;
        if (productsPage.length < pageSize) return;
        isLoadingMoreRef.current = true;
        lastLoadedCountRef.current = productsPage.length;
        setPageSize((prev) => prev + 40);
      },
      { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [productsPage, pageSize]);

  const showLoadingMore =
    isLoadingMoreRef.current && productsPage.length === lastLoadedCountRef.current;

  useEffect(() => {
    if (!productsPage.length) return;
    if (!isLoadingMoreRef.current) return;
    if (productsPage.length > lastLoadedCountRef.current) {
      isLoadingMoreRef.current = false;
    }
  }, [productsPage.length]);

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

  useEffect(() => {
    if (!promotionData?.promotion) return;
    setName(promotionData.promotion.name ?? "");
    setNote(promotionData.promotion.note_to_andrew ?? "");
  }, [promotionData?.promotion]);

  const handleStart = async () => {
    if (!clientId || !token || !name.trim()) return;
    const id = await createPromotion({
      clientId,
      token,
      name: name.trim(),
      noteToAndrew: note.trim() || undefined,
    });
    // Navigate directly to the product picker (same page with promotionId)
    navigate(`/p/${clientId}/new?token=${token}&promotionId=${id}`);
  };

  const handleUpdateDetails = async () => {
    if (!clientId || !token || !promotionId) return;
    await updatePromotionDetails({
      clientId,
      token,
      promotionId,
      name: name.trim(),
      noteToAndrew: note.trim() || undefined,
    });
  };

  const handleRefreshProducts = async () => {
    if (!clientId || !token) return;
    setSyncing(true);
    try {
      await syncShopify({ clientId, token });
    } finally {
      setSyncing(false);
    }
  };

  const handleAdd = async (productId: string) => {
    if (!clientId || !token || !promotionId) return;
    await addPromotionItem({ clientId, token, promotionId, productId });
  };

  const handleUpdate = async (itemId: string, promoType: string, promoValue?: number) => {
    if (!clientId || !token || !promotionId) return;
    await updatePromotionItem({
      clientId,
      token,
      promotionId,
      itemId,
      promoType,
      promoValue: promoValue ?? undefined,
    });
  };

  const handleRemove = async (itemId: string) => {
    if (!clientId || !token || !promotionId) return;
    await removePromotionItem({ clientId, token, promotionId, itemId });
  };

  const handleSubmit = async () => {
    if (!clientId || !token || !promotionId) return;
    await submitPromotion({ clientId, token, promotionId });
    navigate(`/p/${clientId}/promotions/${promotionId}?token=${token}`);
  };

  const [mobileStep, setMobileStep] = useState<"products" | "discounts">("products");

  useEffect(() => {
    if (promotionId) {
      setMobileStep("products");
    }
  }, [promotionId]);

  const items = promotionData?.items ?? [];
  const itemMap = useMemo(() => {
    const map = new Map<string, any>();
    items.forEach((item: any) => map.set(item.product_id, item));
    return map;
  }, [items]);

  const productPicker = (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Promotion name</label>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Note to Andrew (optional)</label>
        <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <Button variant="outline" onClick={handleUpdateDetails} disabled={!name.trim()}>
        Save details
      </Button>
      <div className="space-y-2">
        <label className="text-sm font-medium">Search products</label>
        <Input
          placeholder="Search by title"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Select
          value={vendor ?? "all"}
          onValueChange={(value) => setVendor(value === "all" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All vendors</SelectItem>
            {filters?.vendors?.map((value: string) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={productType ?? "all"}
          onValueChange={(value) => setProductType(value === "all" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by product type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {filters?.productTypes?.map((value: string) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={collection ?? "all"}
          onValueChange={(value) => setCollection(value === "all" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All collections</SelectItem>
            {filters?.collections?.map((value: string) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {!products && cachedProducts.length === 0 && (
          <p className="text-sm text-muted-foreground">Loading products...</p>
        )}
        {productsPage.length === 0 && (
          <p className="text-sm text-muted-foreground">No products found.</p>
        )}
        {productsPage.map((product: any) => {
          const existing = itemMap.get(product.id);
          return (
            <div key={product.id} className="flex gap-3 rounded-md border p-3">
              <div className="h-16 w-16 rounded border bg-white">
                <PromoImage
                  src={product.image_url}
                  alt={product.title}
                  className="h-full w-full rounded object-cover"
                  decoding="async"
                  fallback={
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  }
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{product.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(product.price)}
                  {product.compare_at_price && (
                    <span className="ml-2 line-through">
                      {formatPrice(product.compare_at_price)}
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant={existing ? "secondary" : "default"}
                onClick={() => handleAdd(product.id)}
                disabled={!!existing}
              >
                {existing ? "Added" : "Add to promo"}
              </Button>
            </div>
          );
        })}
        <div ref={loadMoreRef} className="h-6" />
        {showLoadingMore && (
          <p className="text-xs text-muted-foreground">Loading more products…</p>
        )}
      </div>

      <div className="flex justify-end md:hidden">
        <Button onClick={() => setMobileStep("discounts")} disabled={items.length === 0}>
          Next: Set discounts
        </Button>
      </div>
    </Card>
  );

  const promoTray = (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Promo tray</h2>
        <Button onClick={handleSubmit} disabled={items.length === 0}>
          Submit to Andrew
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">Add products to build your promo.</p>
      )}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto md:max-h-[70vh]">
        {items.map((item: any) => {
          const product = item.product;
          if (!product) return null;
          const promoPrice = computePromoPrice(
            product.price,
            item.promo_type,
            item.promo_value
          );
          return (
            <div key={item.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{product.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Current: {formatPrice(product.price)}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => handleRemove(item.id)}>
                  Remove
                </Button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <Select
                  value={item.promo_type}
                  onValueChange={(value) =>
                    handleUpdate(
                      item.id,
                      value,
                      value === "none" ? undefined : item.promo_value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Promo type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sale_price">Sale price</SelectItem>
                    <SelectItem value="percent_off">% Off</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder={item.promo_type === "percent_off" ? "%" : "Price"}
                  value={item.promo_value ?? ""}
                  disabled={item.promo_type === "none"}
                  onChange={(event) =>
                    handleUpdate(
                      item.id,
                      item.promo_type,
                      event.target.value ? Number(event.target.value) : undefined
                    )
                  }
                />
                <div className="text-sm">
                  <p>Promo: {formatPrice(promoPrice)}</p>
                  <p className="text-xs text-muted-foreground">
                    You save {formatSavings(product.price, promoPrice)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-start md:hidden">
        <Button variant="outline" onClick={() => setMobileStep("products")}>
          Back to products
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/30 p-4 pb-10 md:p-8 md:pb-16">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Create a Promotion</h1>
            <p className="text-sm text-muted-foreground">Step {promotionId ? 2 : 1} of 2</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefreshProducts} disabled={syncing}>
              {syncing ? "Refreshing..." : "Refresh products"}
            </Button>
            <Button asChild variant="outline">
              <Link to={`/p/${clientId}?token=${token}`}>Back</Link>
            </Button>
          </div>
        </div>

        {!promotionId ? (
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Promotion name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note to Andrew (optional)</label>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
            </div>
            <Button onClick={handleStart} disabled={!name.trim()}>
              Continue to product picker
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="md:hidden">
              <div className="flex items-center gap-2 rounded-lg border bg-white p-1">
                <Button
                  size="sm"
                  variant={mobileStep === "products" ? "secondary" : "ghost"}
                  className="flex-1"
                  onClick={() => setMobileStep("products")}
                >
                  Select items
                </Button>
                <Button
                  size="sm"
                  variant={mobileStep === "discounts" ? "secondary" : "ghost"}
                  className="flex-1"
                  onClick={() => setMobileStep("discounts")}
                >
                  Set discounts
                </Button>
              </div>
            </div>

            <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] md:gap-6">
              <div className={mobileStep === "products" ? "block" : "hidden md:block"}>
                {productPicker}
              </div>
              <div className={mobileStep === "discounts" ? "block" : "hidden md:block"}>
                <div className="md:sticky md:top-6">{promoTray}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
