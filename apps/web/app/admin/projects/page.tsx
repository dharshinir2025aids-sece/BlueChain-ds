"use client";

import * as React from "react";
import { AlertCircle, Loader2, TreePine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/lib/auth-context";
import { projectsApi, type Project, ApiError } from "@/lib/api";
import { adminNav } from "@/lib/site";

const STATUS_VARIANT: Record<string, "success" | "warning" | "outline"> = {
  VERIFIED: "success", ACTIVE: "success",
  SUBMITTED: "warning", UNDER_REVIEW: "warning",
  DRAFT: "outline", CLOSED: "outline", SUSPENDED: "outline",
};
const ECO: Record<string, string> = { MANGROVE: "Mangrove", SEAGRASS: "Seagrass", SALT_MARSH: "Salt Marsh" };

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return d; }
}

export default function AdminProjectsPage() {
  const { token } = useAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await projectsApi.list(token, { limit: 100 });
      setProjects(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader
        title="All projects"
        description={`National overview of every registered blue carbon restoration project.${total > 0 ? ` ${total.toLocaleString()} total.` : ""}`}
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
              <p className="font-medium text-sm">Unable to load projects</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={load}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && projects.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <TreePine className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No projects registered yet.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && projects.length > 0 && (
        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Registry — {total.toLocaleString()} project{total !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="pb-3 text-left font-medium">Project</th>
                    <th className="pb-3 text-left font-medium">Organisation</th>
                    <th className="pb-3 text-left font-medium">Ecosystem</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                    <th className="pb-3 text-left font-medium">State</th>
                    <th className="pb-3 text-right font-medium">Area (ha)</th>
                    <th className="pb-3 text-left font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="py-3 font-semibold text-[13px] max-w-[200px] truncate">{p.title}</td>
                      <td className="py-3 text-muted-foreground text-xs max-w-[140px] truncate">{p.organization?.name ?? "—"}</td>
                      <td className="py-3 text-xs">{ECO[p.ecosystemType] ?? p.ecosystemType}</td>
                      <td className="py-3">
                        <Badge variant={STATUS_VARIANT[p.status] ?? "outline"} className="rounded-full text-[11px]">
                          {p.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{p.stateCode ?? "—"}</td>
                      <td className="py-3 text-right">{p.areaHa > 0 ? p.areaHa.toLocaleString() : "—"}</td>
                      <td className="py-3 text-xs text-muted-foreground">{fmt(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
