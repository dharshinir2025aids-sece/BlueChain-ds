"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, X, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/lib/auth-context";
import { verificationApi, type VerificationPackage, ApiError } from "@/lib/api";
import { verifierNav } from "@/lib/site";

const STATUS_VARIANT: Record<string, "success" | "warning" | "outline"> = {
  APPROVED: "success",
  PENDING: "warning",
  CHANGES_REQUESTED: "warning",
  REJECTED: "outline",
};

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return d; }
}

export default function VerifierQueuePage() {
  const { token } = useAuth();
  const [packages, setPackages] = React.useState<VerificationPackage[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deciding, setDeciding] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // PENDING and CHANGES_REQUESTED need review
      const result = await verificationApi.list(token, { limit: 50 });
      setPackages(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load verification queue");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { void load(); }, [load]);

  async function decide(id: string, decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED", comments?: string) {
    if (!token) return;
    setDeciding(id);
    setFeedback(null);
    try {
      await verificationApi.decide(token, id, { decision, comments });
      setFeedback({ type: "success", msg: `Decision recorded: ${decision.replace(/_/g, " ")}` });
      void load();
    } catch (err) {
      setFeedback({ type: "error", msg: err instanceof ApiError ? err.message : "Decision failed" });
    } finally {
      setDeciding(null);
    }
  }

  const pending = packages.filter((p) => p.status === "PENDING" || p.status === "CHANGES_REQUESTED");

  return (
    <DashboardShell title="Verifier Desk" roleLabel="Independent Verifier" nav={verifierNav}>
      <PageHeader
        title="Pending packages"
        description="Evidence packages awaiting independent verification review."
      />

      {feedback && (
        <div className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 ${
          feedback.type === "success"
            ? "border-emerald-500/30 bg-emerald-500/8"
            : "border-destructive/30 bg-destructive/8"
        }`}>
          {feedback.type === "success"
            ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            : <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
          <p className={`text-sm ${feedback.type === "success" ? "text-emerald-700 dark:text-emerald-300" : "text-destructive"}`}>
            {feedback.msg}
          </p>
          <button onClick={() => setFeedback(null)} className="ml-auto text-muted-foreground hover:text-foreground">
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
              <p className="font-medium text-sm">Unable to load queue</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={load}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && packages.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <ShieldCheck className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="font-semibold">Queue is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No verification packages are currently pending review.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && packages.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{pending.length}</span> pending
            {" · "}
            <span className="font-medium text-foreground">{total.toLocaleString()}</span> total
          </p>

          {packages.map((vp) => (
            <Card key={vp.id} className="glass-panel">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-[15px]">
                      {vp.report.project.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Submitted by {vp.report.submitter.name}
                      {" · "}
                      Period: {fmt(vp.report.periodStart)} → {fmt(vp.report.periodEnd)}
                    </p>
                    {vp.verifier && (
                      <p className="text-xs text-muted-foreground">
                        Assigned to: {vp.verifier.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[vp.status] ?? "outline"} className="rounded-full text-[11px]">
                      {vp.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {(vp.status === "PENDING" || vp.status === "CHANGES_REQUESTED") && (
                <CardContent>
                  {vp.comments && (
                    <p className="mb-3 text-xs text-muted-foreground bg-muted/30 rounded-xl px-3 py-2">
                      Note: {vp.comments}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={deciding === vp.id}
                      onClick={() => void decide(vp.id, "APPROVED")}
                    >
                      {deciding === vp.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                      disabled={deciding === vp.id}
                      onClick={() => void decide(vp.id, "CHANGES_REQUESTED", "Please review the evidence provided.")}
                    >
                      Request changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-destructive/50 text-destructive hover:bg-destructive/10"
                      disabled={deciding === vp.id}
                      onClick={() => void decide(vp.id, "REJECTED")}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
