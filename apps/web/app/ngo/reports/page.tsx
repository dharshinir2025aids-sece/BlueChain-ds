"use client";

import * as React from "react";
import { AlertCircle, FileCheck2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/lib/auth-context";
import { reportsApi, type MonitoringReport, ApiError } from "@/lib/api";
import { ngoNav } from "@/lib/site";

const STATUS_VARIANT: Record<string, "success" | "warning" | "outline"> = {
  APPROVED: "success",
  SUBMITTED: "warning",
  IN_VERIFICATION: "warning",
  CHANGES_REQUESTED: "warning",
  DRAFT: "outline",
  REJECTED: "outline",
};

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return d; }
}

export default function NgoReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = React.useState<MonitoringReport[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.list(token, { limit: 50 });
      setReports(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader
        title="Monitoring reports"
        description="Compile, submit, and track MRV monitoring reports for your projects."
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
              <p className="font-medium text-sm">Unable to load reports</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={load}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && reports.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <FileCheck2 className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="font-semibold">No reports yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Monitoring reports will appear here once created for your projects.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && reports.length > 0 && (
        <>
          <p className="mb-5 text-sm text-muted-foreground">
            {reports.length}{total > reports.length ? ` of ${total.toLocaleString()}` : ""} report{reports.length !== 1 ? "s" : ""}
          </p>
          <Card className="glass-panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Report history</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      <th className="pb-3 text-left font-medium">Project</th>
                      <th className="pb-3 text-left font-medium">Period</th>
                      <th className="pb-3 text-left font-medium">Status</th>
                      <th className="pb-3 text-left font-medium">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-semibold text-[13px]">{r.project?.title ?? "—"}</td>
                        <td className="py-3 text-muted-foreground text-xs">
                          {fmt(r.periodStart)} → {fmt(r.periodEnd)}
                        </td>
                        <td className="py-3">
                          <Badge variant={STATUS_VARIANT[r.status] ?? "outline"} className="rounded-full text-[11px]">
                            {r.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">{fmt(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
