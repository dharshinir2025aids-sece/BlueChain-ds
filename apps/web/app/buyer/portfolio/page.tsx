"use client";

import * as React from "react";
import { AlertCircle, Layers, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/lib/auth-context";
import { creditsApi, type CarbonCredit, ApiError } from "@/lib/api";
import { buyerNav } from "@/lib/site";

const STATUS_VARIANT: Record<string, "success" | "warning" | "outline"> = {
  MINTED: "success",
  TRANSFERRED: "warning",
  RETIRED: "outline",
  PENDING: "outline",
};

export default function BuyerPortfolioPage() {
  const { user, token } = useAuth();
  const [credits, setCredits] = React.useState<CarbonCredit[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    setError(null);
    try {
      // CORPORATE_BUYER: backend scopes to their own credits automatically
      const result = await creditsApi.list(token, { limit: 50 });
      setCredits(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  React.useEffect(() => { void load(); }, [load]);

  const activetCO2e = credits
    .filter((c) => c.status === "MINTED" || c.status === "TRANSFERRED")
    .reduce((s, c) => s + c.amounttCO2e, 0);
  const retiredtCO2e = credits
    .filter((c) => c.status === "RETIRED")
    .reduce((s, c) => s + c.amounttCO2e, 0);

  return (
    <DashboardShell title="Buyer Portal" roleLabel="Corporate Buyer" nav={buyerNav}>
      <PageHeader
        title="Portfolio"
        description="Your verified blue carbon credit holdings and transfer history."
      />

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
              <p className="font-medium text-sm">Unable to load portfolio</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={load}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && credits.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <Layers className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="font-semibold">No credits in portfolio</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Purchase credits from the marketplace to build your portfolio.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && credits.length > 0 && (
        <div className="space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total credits", value: total.toLocaleString() },
              { label: "Active tCO₂e", value: activetCO2e.toLocaleString() },
              { label: "Retired tCO₂e", value: retiredtCO2e.toLocaleString() },
              { label: "Projects", value: new Set(credits.map((c) => c.projectId)).size.toString() },
            ].map((s) => (
              <div key={s.label} className="glass-panel rounded-2xl p-4">
                <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Credits table */}
          <Card className="glass-panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Credit holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      <th className="pb-3 text-left font-medium">Project</th>
                      <th className="pb-3 text-left font-medium">tCO₂e</th>
                      <th className="pb-3 text-left font-medium">Vintage</th>
                      <th className="pb-3 text-left font-medium">Status</th>
                      <th className="pb-3 text-left font-medium">Token ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credits.map((c) => (
                      <tr key={c.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-semibold text-[13px]">{c.project.title}</td>
                        <td className="py-3">{c.amounttCO2e.toLocaleString()}</td>
                        <td className="py-3 text-muted-foreground">{c.vintageYear}</td>
                        <td className="py-3">
                          <Badge variant={STATUS_VARIANT[c.status] ?? "outline"} className="rounded-full text-[11px]">
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-3 font-mono text-xs text-muted-foreground">
                          {c.tokenId
                            ? <span title={c.tokenId}>{c.tokenId.length > 14 ? `${c.tokenId.slice(0, 14)}…` : c.tokenId}</span>
                            : <span className="text-border">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
