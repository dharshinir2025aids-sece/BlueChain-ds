import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Info,
  Layers,
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
export const metadata = { title: "Coastal Map Explorer" };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ecosystemLabel(type: string) {
  const map: Record<string, string> = {
    MANGROVE: "Mangrove",
    SEAGRASS: "Seagrass",
    SALT_MARSH: "Salt Marsh",
  };
  return map[type] ?? type;
}

function ecosystemColor(type: string) {
  const map: Record<string, string> = {
    MANGROVE: "bg-emerald-500",
    SEAGRASS: "bg-cyan-500",
    SALT_MARSH: "bg-teal-400",
  };
  return map[type] ?? "bg-primary";
}

function ecosystemTextColor(type: string) {
  const map: Record<string, string> = {
    MANGROVE: "text-emerald-700 dark:text-emerald-400",
    SEAGRASS: "text-cyan-700 dark:text-cyan-400",
    SALT_MARSH: "text-teal-700 dark:text-teal-400",
  };
  return map[type] ?? "text-primary";
}

function statusBadge(status: string) {
  const variant =
    ["VERIFIED", "ACTIVE"].includes(status)
      ? "success"
      : ["SUBMITTED", "UNDER_REVIEW"].includes(status)
      ? "warning"
      : "outline";
  return (
    <Badge variant={variant} className="rounded-full text-[10px]">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

// ─── India coastal SVG backdrop ───────────────────────────────────────────────
// A schematic representation of India's coastal regions — NOT a real map.
// Projects are listed in the sidebar; the SVG provides visual context only.

function CoastalVisualization({
  projectCount,
  ecosystemBreakdown,
}: {
  projectCount: number;
  ecosystemBreakdown: Record<string, number>;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-[hsl(215_45%_12%)] dark:bg-[hsl(215_45%_9%)]">
      <svg
        viewBox="0 0 600 480"
        className="w-full"
        role="img"
        aria-label="Schematic representation of India's coastal blue carbon project locations"
      >
        {/* Ocean background */}
        <rect width="600" height="480" fill="#0b1f35" />

        {/* Grid lines (lat/lon suggestion) */}
        {[100, 200, 300, 400, 500].map((x) => (
          <line
            key={`vg-${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2="480"
            stroke="#1e3a5f"
            strokeWidth="0.5"
          />
        ))}
        {[80, 160, 240, 320, 400].map((y) => (
          <line
            key={`hg-${y}`}
            x1="0"
            y1={y}
            x2="600"
            y2={y}
            stroke="#1e3a5f"
            strokeWidth="0.5"
          />
        ))}

        {/* Schematic India coastline — stylised path only */}
        <path
          d="M 200 40
             C 220 35, 260 38, 290 50
             C 330 65, 370 55, 400 70
             C 430 85, 450 100, 460 130
             C 470 160, 465 185, 475 210
             C 480 235, 490 250, 480 270
             C 465 295, 440 310, 420 330
             C 390 360, 360 380, 330 400
             C 300 420, 280 430, 260 445
             C 240 458, 215 460, 190 445
             C 165 430, 150 405, 130 385
             C 105 360, 90 335, 75 305
             C 55 270, 50 240, 55 210
             C 60 180, 70 160, 80 140
             C 95 110, 120 80, 145 60
             C 165 45, 185 43, 200 40 Z"
          fill="#12344d"
          stroke="#1e5f8a"
          strokeWidth="1.5"
        />

        {/* Coastal hotspot markers — positioned relative to India coastal regions */}
        {/* West coast / Gujarat / Karnataka */}
        <circle cx="100" cy="190" r="5" fill="#22c55e" opacity="0.85" />
        <circle cx="100" cy="190" r="10" fill="#22c55e" opacity="0.2" />
        {/* Maharashtra / Goa */}
        <circle cx="115" cy="240" r="4" fill="#22d3ee" opacity="0.85" />
        <circle cx="115" cy="240" r="8" fill="#22d3ee" opacity="0.2" />
        {/* Kerala / Tamil Nadu west */}
        <circle cx="150" cy="350" r="5" fill="#2dd4bf" opacity="0.85" />
        <circle cx="150" cy="350" r="10" fill="#2dd4bf" opacity="0.2" />
        {/* Tamil Nadu east / Palk Strait */}
        <circle cx="330" cy="390" r="4" fill="#22d3ee" opacity="0.85" />
        <circle cx="330" cy="390" r="8" fill="#22d3ee" opacity="0.2" />
        {/* Andhra Pradesh */}
        <circle cx="390" cy="300" r="5" fill="#22c55e" opacity="0.85" />
        <circle cx="390" cy="300" r="10" fill="#22c55e" opacity="0.2" />
        {/* Odisha / West Bengal */}
        <circle cx="440" cy="220" r="6" fill="#22c55e" opacity="0.85" />
        <circle cx="440" cy="220" r="12" fill="#22c55e" opacity="0.2" />
        {/* Sundarbans (largest) */}
        <circle cx="455" cy="195" r="8" fill="#22c55e" opacity="0.9" />
        <circle cx="455" cy="195" r="16" fill="#22c55e" opacity="0.15" />

        {/* Project count overlay */}
        <rect x="16" y="16" width="120" height="52" rx="8" fill="#0b1f35" opacity="0.9" />
        <text x="26" y="34" fill="#94a3b8" fontSize="9" fontFamily="system-ui, sans-serif">
          REGISTERED PROJECTS
        </text>
        <text x="26" y="54" fill="#e2e8f0" fontSize="22" fontWeight="600" fontFamily="system-ui, sans-serif">
          {projectCount}
        </text>

        {/* Compass rose */}
        <g transform="translate(558, 42)">
          <circle cx="0" cy="0" r="14" fill="#0b1f35" stroke="#1e3a5f" strokeWidth="1" />
          <text x="0" y="-6" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="system-ui">N</text>
          <line x1="0" y1="-3" x2="0" y2="-12" stroke="#64748b" strokeWidth="1.5" />
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
        {[
          { label: "Mangrove", color: "bg-emerald-500" },
          { label: "Seagrass", color: "bg-cyan-400" },
          { label: "Salt marsh", color: "bg-teal-400" },
        ].map((item) => (
          <span
            key={item.label}
            className="flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-[10px] text-slate-200 backdrop-blur-sm"
          >
            <span className={`h-2 w-2 rounded-full ${item.color}`} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[10px] text-slate-400 backdrop-blur-sm">
        <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
        Schematic — not to scale
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MapPage() {
  let data;
  let fetchError = false;

  try {
    data = await publicApi.projects({ limit: 100 });
  } catch {
    fetchError = true;
    data = { items: [], total: 0, page: 1, limit: 100 };
  }

  // Ecosystem breakdown for legend
  const ecosystemBreakdown: Record<string, number> = {};
  for (const p of data.items) {
    ecosystemBreakdown[p.ecosystemType] =
      (ecosystemBreakdown[p.ecosystemType] ?? 0) + 1;
  }

  return (
    <div className="surface-gradient">
      <div className="container py-14 sm:py-16">
        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <p className="eyebrow mb-3">GIS Explorer</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Coastal Map Explorer
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            A geographic overview of registered blue carbon restoration sites
            along India&apos;s coastline. Click any project to view its full
            registry record.
          </p>
        </div>

        {/* Ecosystem legend stats */}
        <div className="mb-6 flex flex-wrap gap-3">
          {Object.entries(ecosystemBreakdown).map(([type, count]) => (
            <div
              key={type}
              className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-1.5 text-sm"
            >
              <span
                className={`h-2 w-2 rounded-full ${ecosystemColor(type)}`}
                aria-hidden="true"
              />
              <span className={`font-medium ${ecosystemTextColor(type)}`}>
                {ecosystemLabel(type)}
              </span>
              <span className="text-muted-foreground">
                {count} project{count !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
          {data.items.length === 0 && !fetchError && (
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              No projects registered yet
            </div>
          )}
        </div>

        {/* Main layout */}
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          {/* Map visualization */}
          <div className="space-y-3">
            <CoastalVisualization
              projectCount={data.total}
              ecosystemBreakdown={ecosystemBreakdown}
            />

            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="flex items-start gap-3 py-3">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The visualization above is a schematic coastal overview, not a
                  georeferenced map. Interactive GIS layers with precise plot
                  boundaries require geographic coordinates stored on individual
                  projects — currently none are present in the registry. As
                  projects add plot boundary data the map will be updated.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Project sidebar list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                All projects
                <span className="ml-2 text-muted-foreground font-normal">
                  ({data.total})
                </span>
              </h2>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full text-xs"
              >
                <Link href="/registry">
                  Full registry
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {fetchError && (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Unable to load projects. Please try again shortly.
              </div>
            )}

            {!fetchError && data.items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-8 text-center">
                <MapPin
                  className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">No projects yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Projects will appear here once they are registered in the
                  BlueChain registry.
                </p>
              </div>
            )}

            <div
              className="max-h-[580px] space-y-2 overflow-y-auto pr-1"
              role="list"
              aria-label="Registered projects"
            >
              {data.items.map((project) => (
                <Link
                  key={project.id}
                  href={`/registry/${project.id}`}
                  role="listitem"
                  className="group block rounded-xl border border-border/70 bg-card p-3.5 transition-all duration-150 hover:border-primary/30 hover:bg-primary/[0.02]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold group-hover:text-primary transition-colors">
                        {project.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Building2
                          className="h-3 w-3 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {project.organization?.name}
                        </span>
                      </p>
                    </div>
                    {statusBadge(project.status)}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${ecosystemColor(project.ecosystemType)}`}
                        aria-hidden="true"
                      />
                      {ecosystemLabel(project.ecosystemType)}
                    </span>
                    {project.stateCode && (
                      <span className="flex items-center gap-1">
                        <MapPin
                          className="h-3 w-3 shrink-0"
                          aria-hidden="true"
                        />
                        {project.stateCode}
                      </span>
                    )}
                    {project._count.credits > 0 && (
                      <span className="flex items-center gap-1">
                        <Layers
                          className="h-3 w-3 shrink-0"
                          aria-hidden="true"
                        />
                        {project._count.credits} credit
                        {project._count.credits !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Link to full registry if there are more */}
            {data.total > data.items.length && (
              <div className="pt-2 text-center">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  <Link href="/registry">
                    <TreePine className="h-3.5 w-3.5" aria-hidden="true" />
                    View all {data.total} projects
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
