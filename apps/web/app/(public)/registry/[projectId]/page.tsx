import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FileCheck2,
  Hash,
  Layers,
  Leaf,
  MapPin,
  TreePine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { publicApi } from "@/lib/api";

export const revalidate = 60;

// ─── Dynamic metadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  try {
    const project = await publicApi.project(projectId);
    return {
      title: project.title,
      description: project.description ?? `Blue carbon project in BlueChain Registry — ${project.ecosystemType}`,
    };
  } catch {
    return { title: "Project" };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusVariant(status: string): "success" | "warning" | "outline" | "default" {
  if (["VERIFIED", "ACTIVE", "APPROVED"].includes(status)) return "success";
  if (["SUBMITTED", "UNDER_REVIEW"].includes(status)) return "warning";
  return "outline";
}

function ecosystemLabel(type: string) {
  const map: Record<string, string> = {
    MANGROVE: "Mangrove",
    SEAGRASS: "Seagrass",
    SALT_MARSH: "Salt Marsh",
  };
  return map[type] ?? type;
}

function creditStatusVariant(status: string | null | undefined): "success" | "warning" | "outline" {
  if (status === "MINTED") return "success";
  if (status === "TRANSFERRED") return "warning";
  if (status === "RETIRED") return "outline";
  return "outline";
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function truncate(s: string | null | undefined, n = 16): string {
  if (!s) return "—";
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

// ─── Detail field component ───────────────────────────────────────────────────

function DetailField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RegistryProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  let project;
  let notFound = false;
  let fetchError = false;

  try {
    project = await publicApi.project(projectId);
    if (!project) notFound = true;
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 404) {
      notFound = true;
    } else {
      fetchError = true;
    }
  }

  // ── Error / not-found states ─────────────────────────────────────────────

  if (notFound) {
    return (
      <div className="surface-gradient">
        <div className="container py-14 sm:py-16">
          <div className="flex min-h-[30rem] flex-col items-center justify-center gap-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              404
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Project not found
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              This project ID doesn&apos;t exist in the BlueChain registry, or
              it may have been removed.
            </p>
            <Button asChild className="rounded-full">
              <Link href="/registry">
                <ArrowLeft className="h-4 w-4" />
                Back to registry
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError || !project) {
    return (
      <div className="surface-gradient">
        <div className="container py-14 sm:py-16">
          <div className="flex min-h-[30rem] flex-col items-center justify-center gap-5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Unable to load project
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              The registry API is temporarily unavailable. Please try again
              shortly.
            </p>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/registry">Back to registry</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Successful render ────────────────────────────────────────────────────

  return (
    <div className="surface-gradient">
      <div className="container py-10 sm:py-14">
        {/* Back link */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <Link href="/registry">
              <ArrowLeft className="h-4 w-4" />
              Public registry
            </Link>
          </Button>
        </div>

        {/* Hero header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={statusVariant(project.status)}
                className="rounded-full"
              >
                {project.status.replace(/_/g, " ")}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                {ecosystemLabel(project.ecosystemType)}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {project.title}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              {project.organization?.name}
              {project.organization?.type && (
                <span className="text-border">&middot;</span>
              )}
              {project.organization?.type?.replace(/_/g, " ")}
            </p>
            {project.description && (
              <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Project details grid */}
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          {/* ── Core details ── */}
          <Card className="glass-panel lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TreePine className="h-4 w-4 text-primary" aria-hidden="true" />
                Project details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
                <DetailField
                  label="State / region"
                  value={project.stateCode ?? "—"}
                  icon={MapPin}
                />
                <DetailField
                  label="Area"
                  value={
                    project.areaHa && project.areaHa > 0
                      ? `${project.areaHa.toLocaleString()} ha`
                      : "—"
                  }
                  icon={Leaf}
                />
                <DetailField
                  label="Methodology"
                  value={project.methodology ?? "—"}
                />
                <DetailField
                  label="Start date"
                  value={formatDate(project.startDate)}
                  icon={CalendarDays}
                />
                <DetailField
                  label="Registered"
                  value={formatDate(project.createdAt)}
                  icon={CalendarDays}
                />
                <DetailField
                  label="Ecosystem"
                  value={ecosystemLabel(project.ecosystemType)}
                />
              </dl>
            </CardContent>
          </Card>

          {/* ── Counts ── */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
                Registry activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Monitoring plots", value: project._count.plots },
                  { label: "Verified reports", value: project._count.reports },
                  { label: "Carbon credits", value: project._count.credits },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Monitoring reports ── */}
        {project.reports && project.reports.length > 0 && (
          <Card className="glass-panel mt-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCheck2
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                Recent approved reports
              </CardTitle>
              <CardDescription>
                Publicly verified MRV reporting periods for this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      <th className="pb-3 text-left font-medium">Period start</th>
                      <th className="pb-3 text-left font-medium">Period end</th>
                      <th className="pb-3 text-left font-medium">Status</th>
                      <th className="pb-3 text-left font-medium">IPFS CID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.reports.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-3">{formatDate(r.periodStart)}</td>
                        <td className="py-3">{formatDate(r.periodEnd)}</td>
                        <td className="py-3">
                          <Badge
                            variant="success"
                            className="rounded-full text-[11px]"
                          >
                            {r.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 font-mono text-xs text-muted-foreground">
                          {r.ipfsCid ? (
                            <span title={r.ipfsCid}>
                              {truncate(r.ipfsCid, 20)}
                            </span>
                          ) : (
                            <span className="text-border">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Carbon credits ── */}
        {project.credits && project.credits.length > 0 && (
          <Card className="glass-panel mt-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="h-4 w-4 text-primary" aria-hidden="true" />
                Carbon credits
              </CardTitle>
              <CardDescription>
                Blue carbon certificates issued for this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      <th className="pb-3 text-left font-medium">tCO₂e</th>
                      <th className="pb-3 text-left font-medium">Vintage</th>
                      <th className="pb-3 text-left font-medium">Status</th>
                      <th className="pb-3 text-left font-medium">Token ID</th>
                      <th className="pb-3 text-left font-medium">Mint tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.credits.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-3 font-semibold">
                          {c.amounttCO2e.toLocaleString()}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {c.vintageYear ?? "—"}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={creditStatusVariant(c.status)}
                            className="rounded-full text-[11px]"
                          >
                            {c.status?.replace(/_/g, " ") ?? "—"}
                          </Badge>
                        </td>
                        <td className="py-3 font-mono text-xs text-muted-foreground">
                          {c.tokenId ? truncate(c.tokenId) : "—"}
                        </td>
                        <td className="py-3 font-mono text-xs text-muted-foreground">
                          {c.txMint ? (
                            <span title={c.txMint}>{truncate(c.txMint)}</span>
                          ) : (
                            <span className="text-border">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state when no reports or credits */}
        {(!project.reports || project.reports.length === 0) &&
          (!project.credits || project.credits.length === 0) && (
            <Card className="glass-panel mt-5">
              <CardContent className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No approved reports or issued credits recorded yet for this
                  project.
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
