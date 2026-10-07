"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Leaf, Loader2, MapPin, Plus, TreePine } from "lucide-react";
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
import { projectsApi, type Project, ApiError } from "@/lib/api";
import { ngoNav } from "@/lib/site";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ECOSYSTEM_ICON: Record<string, string> = {
  MANGROVE: "🌿",
  SEAGRASS: "🌊",
  SALT_MARSH: "🦢",
};
const ECOSYSTEM_LABEL: Record<string, string> = {
  MANGROVE: "Mangrove",
  SEAGRASS: "Seagrass",
  SALT_MARSH: "Salt Marsh",
};

function statusVariant(s: string): "success" | "warning" | "outline" {
  if (["VERIFIED", "ACTIVE"].includes(s)) return "success";
  if (["SUBMITTED", "UNDER_REVIEW"].includes(s)) return "warning";
  return "outline";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NgoProjectsPage() {
  const { user, token } = useAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await projectsApi.list(token, { limit: 50 });
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
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader
        title="Projects"
        description="Restoration projects managed by your organisation."
        action={
          <Button asChild size="sm" className="rounded-full">
            <Link href="/ngo/projects/new">
              <Plus className="h-4 w-4" />
              New project
            </Link>
          </Button>
        }
      />

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[14rem] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <Card className="glass-panel border-destructive/30">
          <CardContent className="flex items-start gap-3 py-6">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-sm">Unable to load projects</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={load}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!loading && !error && projects.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <TreePine className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="font-semibold">No projects yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first restoration project to get started.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link href="/ngo/projects/new">
                <Plus className="h-4 w-4" />
                Create project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Project grid */}
      {!loading && !error && projects.length > 0 && (
        <>
          <p className="mb-5 text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{projects.length}</span>
            {total > projects.length ? ` of ${total.toLocaleString()}` : ""} projects
            {user?.name ? ` for ${user.name}` : ""}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/registry/${project.id}`} className="group block">
                <Card className="glass-panel h-full hover-lift hover:border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="text-2xl" aria-label={ECOSYSTEM_LABEL[project.ecosystemType] ?? project.ecosystemType}>
                        {ECOSYSTEM_ICON[project.ecosystemType] ?? "🌱"}
                      </span>
                      <Badge variant={statusVariant(project.status)} className="rounded-full text-[11px]">
                        {project.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <CardTitle className="text-[15px] leading-snug group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {project.organization?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Ecosystem</dt>
                        <dd className="font-medium">{ECOSYSTEM_LABEL[project.ecosystemType] ?? project.ecosystemType}</dd>
                      </div>
                      {project.stateCode && (
                        <div>
                          <dt className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />State
                          </dt>
                          <dd className="font-medium">{project.stateCode}</dd>
                        </div>
                      )}
                      {project.areaHa > 0 && (
                        <div>
                          <dt className="text-muted-foreground flex items-center gap-1">
                            <Leaf className="h-3 w-3" />Area
                          </dt>
                          <dd className="font-medium">{project.areaHa.toLocaleString()} ha</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-muted-foreground">Reports</dt>
                        <dd className="font-medium">{project._count.reports}</dd>
                      </div>
                    </dl>
                    <div className="mt-3 flex justify-end">
                      <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100")}>
                        View <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
