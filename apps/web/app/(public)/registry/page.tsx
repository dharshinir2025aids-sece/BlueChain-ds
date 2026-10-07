import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileCheck2,
  Layers,
  MapPin,
  Search,
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
import { RegistrySearch } from "./registry-search";

export const revalidate = 60;
export const metadata = { title: "Public Registry" };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, "success" | "default" | "warning" | "outline"> = {
    VERIFIED: "success",
    ACTIVE: "success",
    APPROVED: "success",
    SUBMITTED: "warning",
    UNDER_REVIEW: "warning",
    DRAFT: "outline",
    CLOSED: "outline",
    SUSPENDED: "outline",
  };
  return (
    <Badge variant={map[status] ?? "outline"} className="rounded-full text-[11px]">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function ecosystemIcon(type: string) {
  const icons: Record<string, string> = {
    MANGROVE: "🌿",
    SEAGRASS: "🌊",
    SALT_MARSH: "🦢",
  };
  return icons[type] ?? "🌱";
}

function ecosystemLabel(type: string) {
  const labels: Record<string, string> = {
    MANGROVE: "Mangrove",
    SEAGRASS: "Seagrass",
    SALT_MARSH: "Salt Marsh",
  };
  return labels[type] ?? type;
}

// ─── Stats bar (server‑fetched) ───────────────────────────────────────────────

async function RegistryStats() {
  let stats;
  try {
    stats = await publicApi.stats();
  } catch {
    stats = {
      totalProjects: 0,
      verifiedProjects: 0,
      totalCredits: 0,
      retiredCredits: 0,
      totalTco2e: 0,
    };
  }

  const statItems = [
    {
      label: "Total projects",
      value: stats.totalProjects.toLocaleString(),
      icon: TreePine,
    },
    {
      label: "Verified & active",
      value: stats.verifiedProjects.toLocaleString(),
      icon: FileCheck2,
    },
    {
      label: "Credits issued",
      value: stats.totalCredits.toLocaleString(),
      icon: Layers,
    },
    {
      label: "tCO₂e sequestered",
      value:
        stats.totalTco2e > 0
          ? stats.totalTco2e.toLocaleString(undefined, { maximumFractionDigits: 0 })
          : "—",
      icon: MapPin,
    },
  ];

  return (
    <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
      {statItems.map((s) => (
        <div
          key={s.label}
          className="glass-panel flex flex-col gap-1.5 rounded-2xl p-4"
        >
          <s.icon className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Project grid (server‑fetched with search/filter params) ─────────────────

async function ProjectGrid({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined;
  const ecosystemType =
    typeof searchParams.ecosystemType === "string"
      ? searchParams.ecosystemType
      : undefined;
  const status =
    typeof searchParams.status === "string" ? searchParams.status : undefined;
  const page =
    typeof searchParams.page === "string" ? Number(searchParams.page) || 1 : 1;

  let result;
  let fetchError = false;

  try {
    result = await publicApi.projects({
      search,
      ecosystemType,
      status,
      page,
      limit: 12,
    });
  } catch {
    fetchError = true;
    result = { items: [], total: 0, page: 1, limit: 12 };
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[20rem] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 text-center">
        <p className="text-base font-semibold">Unable to load projects</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          The registry API is temporarily unavailable. Please try again shortly.
        </p>
        <Button asChild variant="outline" className="rounded-full" size="sm">
          <Link href="/registry">Retry</Link>
        </Button>
      </div>
    );
  }

  if (result.items.length === 0) {
    return (
      <div className="flex min-h-[20rem] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 text-center">
        <Search className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
        <p className="text-base font-semibold">No projects found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {search || ecosystemType || status
            ? "Try adjusting your filters or search terms."
            : "No projects have been registered in the BlueChain registry yet."}
        </p>
        {(search || ecosystemType || status) && (
          <Button asChild variant="outline" className="rounded-full" size="sm">
            <Link href="/registry">Clear filters</Link>
          </Button>
        )}
      </div>
    );
  }

  const totalPages = Math.ceil(result.total / result.limit);

  return (
    <>
      {/* Results count */}
      <p className="mb-5 text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {(page - 1) * result.limit + 1}–
          {Math.min(page * result.limit, result.total)}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">
          {result.total.toLocaleString()}
        </span>{" "}
        projects
      </p>

      {/* Project cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {result.items.map((project) => (
          <Link
            key={project.id}
            href={`/registry/${project.id}`}
            className="group block"
          >
            <Card className="glass-panel h-full hover-lift hover:border-primary/30">
              <CardHeader className="pb-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span
                    className="text-2xl"
                    aria-label={ecosystemLabel(project.ecosystemType)}
                  >
                    {ecosystemIcon(project.ecosystemType)}
                  </span>
                  {statusBadge(project.status)}
                </div>
                <CardTitle className="text-[15px] leading-snug group-hover:text-primary transition-colors">
                  {project.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs">
                  <Building2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {project.organization?.name ?? "—"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {project.description && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                )}

                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Ecosystem</dt>
                    <dd className="font-medium">
                      {ecosystemLabel(project.ecosystemType)}
                    </dd>
                  </div>
                  {project.stateCode && (
                    <div>
                      <dt className="text-muted-foreground">State</dt>
                      <dd className="font-medium">{project.stateCode}</dd>
                    </div>
                  )}
                  {project.areaHa != null && project.areaHa > 0 && (
                    <div>
                      <dt className="text-muted-foreground">Area</dt>
                      <dd className="font-medium">
                        {project.areaHa.toLocaleString()} ha
                      </dd>
                    </div>
                  )}
                  {project._count.credits > 0 && (
                    <div>
                      <dt className="text-muted-foreground">Credits</dt>
                      <dd className="font-medium">
                        {project._count.credits.toLocaleString()}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="flex items-center justify-end">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View details
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <Link
                href={`/registry?${new URLSearchParams({
                  ...(search && { search }),
                  ...(ecosystemType && { ecosystemType }),
                  ...(status && { status }),
                  page: String(page - 1),
                })}`}
              >
                Previous
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <Link
                href={`/registry?${new URLSearchParams({
                  ...(search && { search }),
                  ...(ecosystemType && { ecosystemType }),
                  ...(status && { status }),
                  page: String(page + 1),
                })}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RegistryPage({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await rawSearchParams;

  return (
    <div className="surface-gradient">
      <div className="container py-14 sm:py-16">
        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <p className="eyebrow mb-3">Transparency</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Public Registry
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            BlueChain provides transparent access to blue carbon project and
            credit lifecycle information. Every project, report, and credit
            record below is traceable back to verifiable field evidence.
          </p>
        </div>

        {/* Stats */}
        <RegistryStats />

        {/* Search + filters (client component) */}
        <RegistrySearch />

        {/* Project grid — reads searchParams from URL */}
        <ProjectGrid searchParams={searchParams} />
      </div>
    </div>
  );
}
