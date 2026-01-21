import { Link, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/integrations/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

const promoApi = api as any;

export default function PromoPortalHome() {
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { toast } = useToast();

  const validation = useQuery(
    promoApi.promoClients.validatePortalToken,
    clientId && token ? { clientId, token } : "skip"
  );

  const promotions = useQuery(
    promoApi.promoPromotions.listPromotionsForPortal,
    clientId && token && validation?.valid ? { clientId, token } : "skip"
  );
  const deletePromotion = useMutation(promoApi.promoPromotions.deletePromotion);

  if (!clientId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6 max-w-md text-center space-y-2">
          <h1 className="text-xl font-semibold">Missing portal token</h1>
          <p className="text-sm text-muted-foreground">
            Please use the portal link provided by Andrew.
          </p>
        </Card>
      </div>
    );
  }

  if (validation && !validation.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6 max-w-md text-center space-y-2">
          <h1 className="text-xl font-semibold">Portal link expired</h1>
          <p className="text-sm text-muted-foreground">
            Please request a new portal link from Andrew.
          </p>
        </Card>
      </div>
    );
  }

  const handleDelete = async (promotionId: string) => {
    if (!clientId || !token) return;
    await deletePromotion({ clientId, token, promotionId });
    toast({ title: "Draft deleted" });
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {validation?.client?.name ?? "Client"} Promo Portal
            </h1>
            <p className="text-sm text-muted-foreground">Create and track EDM promotions.</p>
          </div>
          <Button asChild>
            <Link to={`/p/${clientId}/new?token=${token}`}>Create New Promotion</Link>
          </Button>
        </div>

        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-medium">Your promotions</h2>
          {promotions ? (
            <div className="space-y-2">
              {promotions.length === 0 && (
                <p className="text-sm text-muted-foreground">No promotions yet.</p>
              )}
              {promotions.map((promo: any) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
                >
                  <Link
                    to={
                      promo.status === "draft"
                        ? `/p/${clientId}/new?token=${token}&promotionId=${promo.id}`
                        : `/p/${clientId}/promotions/${promo.id}?token=${token}`
                    }
                    className="flex-1"
                  >
                    <p className="font-medium">{promo.name}</p>
                    <p className="text-xs text-muted-foreground">Status: {promo.status}</p>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {promo.submitted_at ? "Submitted" : "Draft"}
                    </span>
                    {promo.status === "draft" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete draft promotion?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This removes the draft and its selected products. This can’t be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(promo.id)}>
                              Delete draft
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading promotions...</p>
          )}
        </Card>
      </div>
    </div>
  );
}
