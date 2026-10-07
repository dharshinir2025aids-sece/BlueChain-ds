"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Layers, Loader2, ShoppingCart, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/lib/auth-context";
import { marketplaceApi, type MarketplaceListing, ApiError } from "@/lib/api";
import { buyerNav } from "@/lib/site";

const ECOSYSTEM_LABEL: Record<string, string> = {
  MANGROVE: "Mangrove",
  SEAGRASS: "Seagrass",
  SALT_MARSH: "Salt Marsh",
};

export default function BuyerMarketplacePage() {
  const { token } = useAuth();
  const [listings, setListings] = React.useState<MarketplaceListing[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Purchase state
  const [purchasing, setPurchasing] = React.useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = React.useState<string | null>(null);
  const [purchaseError, setPurchaseError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await marketplaceApi.listListings(token, { limit: 50 });
      setListings(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { void load(); }, [load]);

  async function handlePurchase(listing: MarketplaceListing) {
    if (!token) return;
    setPurchasing(listing.id);
    setPurchaseSuccess(null);
    setPurchaseError(null);
    try {
      await marketplaceApi.purchase(token, listing.id, { quantity: listing.credit.amounttCO2e });
      setPurchaseSuccess(listing.credit.project.title);
      // Reload listings to reflect sold status
      void load();
    } catch (err) {
      setPurchaseError(err instanceof ApiError ? err.message : "Purchase failed");
    } finally {
      setPurchasing(null);
    }
  }

  return (
    <DashboardShell title="Buyer Portal" roleLabel="Corporate Buyer" nav={buyerNav}>
      <PageHeader
        title="Marketplace"
        description="Browse available verified blue carbon credits from coastal restoration projects."
      />

      {/* Purchase feedback */}
      {purchaseSuccess && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Purchase successful — credits from <strong>{purchaseSuccess}</strong> added to your portfolio.
          </p>
          <button onClick={() => setPurchaseSuccess(null)} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {purchaseError && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{purchaseError}</p>
          <button onClick={() => setPurchaseError(null)} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading && (
        <div className="flex min-h-[14rem] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && error && (
        <Card className="glass-panel border-destructive/30">
          <CardContent className="flex items-start gap-3 py-6">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-sm">Unable to load listings</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={load}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && listings.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="font-semibold">No listings available</p>
              <p className="mt-1 text-sm text-muted-foreground">
                There are currently no active credit listings on the marketplace.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && listings.length > 0 && (
        <>
          <p className="mb-5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{total.toLocaleString()}</span> listing{total !== 1 ? "s" : ""} available
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <Card key={listing.id} className="glass-panel hover-lift flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full text-[11px]">
                      {ECOSYSTEM_LABEL[listing.credit.project.ecosystemType] ?? listing.credit.project.ecosystemType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Vintage {listing.credit.vintageYear}
                    </span>
                  </div>
                  <CardTitle className="text-[15px] leading-snug mt-2">
                    {listing.credit.project.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Seller: {listing.seller.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 justify-between gap-4">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div>
                      <dt className="text-muted-foreground">tCO₂e</dt>
                      <dd className="font-semibold">{listing.credit.amounttCO2e.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Price / tonne</dt>
                      <dd className="font-semibold">₹{listing.pricePerTonne.toLocaleString()}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Total value</dt>
                      <dd className="font-semibold text-primary">
                        ₹{(listing.credit.amounttCO2e * listing.pricePerTonne).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                  {listing.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{listing.notes}</p>
                  )}
                  <Button
                    className="w-full rounded-full"
                    disabled={purchasing === listing.id}
                    onClick={() => void handlePurchase(listing)}
                  >
                    {purchasing === listing.id ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Purchasing…</>
                    ) : (
                      <><Layers className="h-4 w-4" />Purchase credits</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
