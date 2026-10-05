import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  BookOpen,
  FileCheck2,
  Layers,
  Lock,
  Search,
  ShieldCheck,
  TreePine,
  Users,
  Waves,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { publicApi } from "@/lib/api";

export const revalidate = 60;
export const metadata = { title: "Documentation" };

// ─── Live stat bar ────────────────────────────────────────────────────────────

async function LiveStats() {
  let stats;
  try {
    stats = await publicApi.stats();
  } catch {
    stats = {
      totalProjects: 0,
      verifiedProjects: 0,
      totalCredits: 0,
      mintedCredits: 0,
      retiredCredits: 0,
      totalTco2e: 0,
    };
  }

  const items = [
    { label: "Registered projects", value: stats.totalProjects.toLocaleString() },
    { label: "Verified & active", value: stats.verifiedProjects.toLocaleString() },
    { label: "Credits issued", value: stats.totalCredits.toLocaleString() },
    { label: "Credits retired", value: stats.retiredCredits.toLocaleString() },
  ];

  return (
    <div className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="glass-panel rounded-2xl p-4 text-center"
        >
          <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  id,
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-6">
      <div>
        <span className="eyebrow flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {eyebrow}
        </span>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

// ─── Role table ───────────────────────────────────────────────────────────────

const ROLES = [
  {
    role: "FIELD_WORKER",
    label: "Field Worker",
    responsibilities:
      "Records on-site observations (biomass, water quality, photo surveys, sensor readings) linked to GPS coordinates and plot IDs. Uploads evidence media.",
  },
  {
    role: "NGO_MANAGER",
    label: "NGO Manager",
    responsibilities:
      "Creates and manages restoration projects and monitoring plots. Compiles observations into Monitoring Reports and submits them for verification.",
  },
  {
    role: "VERIFIER",
    label: "Independent Verifier",
    responsibilities:
      "Reviews evidence packages from NGOs. Approves, rejects, or requests changes to verification packages. Cannot mint credits.",
  },
  {
    role: "NCCR_ADMIN",
    label: "NCCR Admin",
    responsibilities:
      "National Climate Change Registry administrator. Authorises credit issuance, manages the national project registry, and has full oversight of all reports.",
  },
  {
    role: "CORPORATE_BUYER",
    label: "Corporate Buyer",
    responsibilities:
      "Browses the marketplace, purchases verified blue carbon credits, and retires them against ESG commitments. Receives retirement certificates.",
  },
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    responsibilities:
      "Platform operator. Full access to all modules, user management, and system health monitoring.",
  },
];

// ─── Credit lifecycle steps ───────────────────────────────────────────────────

const CREDIT_LIFECYCLE = [
  {
    step: "PENDING",
    title: "Pending",
    body: "A credit record is created in the database and awaits on-chain minting. The NCCR Admin reviews the underlying verification package before authorising issuance.",
  },
  {
    step: "MINTED",
    title: "Minted",
    body: "The credit has been authorised and issued. A blockchain transaction hash (txMint) is recorded. The credit appears in the national registry and is available for the marketplace.",
  },
  {
    step: "TRANSFERRED",
    title: "Transferred",
    body: "The credit has been sold through the marketplace and ownership has changed. A CreditTransfer record is created linking the previous and new owner.",
  },
  {
    step: "RETIRED",
    title: "Retired",
    body: "The credit has been permanently and irreversibly retired. A Retirement record is created with a unique certificate ID and an optional on-chain retirement transaction hash. Retired credits cannot be transferred.",
  },
];

// ─── MRV steps ────────────────────────────────────────────────────────────────

const MRV_STAGES = [
  {
    icon: Search,
    title: "Monitoring",
    body: "Field workers record structured observations at GPS-tagged plot locations. Each observation captures ecosystem-specific metrics (biomass, water quality, photo survey, sensor readings) along with supporting media evidence.",
  },
  {
    icon: FileCheck2,
    title: "Reporting",
    body: "NGO Managers compile approved observations into a MonitoringReport covering a defined period. Reports include a summary, an optional IPFS content hash for the evidence bundle, and a content integrity hash.",
  },
  {
    icon: ShieldCheck,
    title: "Verification",
    body: "An independent Verifier reviews the evidence package attached to the MonitoringReport. The package may be approved, rejected, or returned with a changes-requested decision. The complete decision history is recorded in the audit trail.",
  },
  {
    icon: BadgeCheck,
    title: "Authorisation",
    body: "An NCCR Admin reviews the verified package and authorises the issuance of carbon credits proportional to the verified sequestration. The MonitoringReport status moves to APPROVED before any credit can be minted.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DocsPage() {
  return (
    <div className="surface-gradient">
      <div className="container py-14 sm:py-16">
        {/* Page header */}
        <div className="mb-10 max-w-3xl">
          <p className="eyebrow mb-3">Documentation</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            How BlueChain MRV works
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Field capture → NGO reporting → independent verification → national
            authorisation → credit issuance → marketplace → retirement. Each
            stage is auditable, immutable, and traceable to the original
            evidence.
          </p>

          {/* Table of contents */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { href: "#mrv-workflow", label: "MRV workflow" },
              { href: "#methodology", label: "Methodology" },
              { href: "#credit-lifecycle", label: "Credit lifecycle" },
              { href: "#blockchain", label: "Blockchain" },
              { href: "#roles", label: "Roles" },
              { href: "#technology", label: "Technology" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Live stats */}
        <LiveStats />

        {/* ── 1. MRV Workflow ── */}
        <div className="space-y-20">
          <Section id="mrv-workflow" icon={Waves} eyebrow="01" title="The MRV workflow">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MRV_STAGES.map((stage, i) => (
                <Card key={stage.title} className="glass-panel">
                  <CardHeader className="pb-3">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                      <stage.icon
                        className="h-4 w-4 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        STAGE {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <CardTitle className="text-[15px]">{stage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {stage.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          {/* ── 2. Methodology ── */}
          <Section id="methodology" icon={TreePine} eyebrow="02" title="MRV methodology">
            <div className="grid gap-5 md:grid-cols-2">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="text-base">Observation types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      type: "BIOMASS",
                      description:
                        "Above- and below-ground biomass surveys for carbon stock estimation.",
                    },
                    {
                      type: "WATER_QUALITY",
                      description:
                        "Salinity, turbidity, dissolved oxygen, and pH readings at plot locations.",
                    },
                    {
                      type: "PHOTO_SURVEY",
                      description:
                        "Georeferenced photographic records for canopy cover and vegetation condition.",
                    },
                    {
                      type: "SENSOR_READING",
                      description:
                        "Automated sensor data from deployed IoT monitoring devices.",
                    },
                    {
                      type: "GENERAL",
                      description:
                        "Free-form field notes, condition reports, and miscellaneous observations.",
                    },
                  ].map((item) => (
                    <div key={item.type} className="flex gap-3">
                      <Badge
                        variant="secondary"
                        className="mt-0.5 h-fit shrink-0 rounded-full font-mono text-[10px]"
                      >
                        {item.type}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="text-base">Evidence standards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    Each observation must be linked to a specific plot and worker
                    identity. GPS coordinates are captured at the time of
                    observation and stored with the record.
                  </p>
                  <p>
                    Media assets (images, sensor files) are stored with a SHA-256
                    content hash and an IPFS CID for content-addressable
                    permanence. This ensures the evidence cannot be silently
                    modified after submission.
                  </p>
                  <p>
                    Monitoring Reports aggregate observations over a defined
                    period. The report&apos;s evidence bundle hash is stored in
                    the <code className="rounded bg-muted px-1 text-xs">contentHash</code>{" "}
                    field and optionally anchored to IPFS via{" "}
                    <code className="rounded bg-muted px-1 text-xs">ipfsCid</code>.
                  </p>
                  <p>
                    An approved MonitoringReport with a{" "}
                    <code className="rounded bg-muted px-1 text-xs">status: APPROVED</code>{" "}
                    is the minimum prerequisite for credit issuance. The NCCR
                    Admin independently reviews the verification decision before
                    authorising credits.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── 3. Credit lifecycle ── */}
          <Section id="credit-lifecycle" icon={Layers} eyebrow="03" title="Carbon credit lifecycle">
            <div className="relative">
              {/* Timeline connector */}
              <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-primary/60 via-primary/30 to-transparent sm:block" />

              <ol className="space-y-5">
                {CREDIT_LIFECYCLE.map((item) => (
                  <li key={item.step} className="relative flex gap-5">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-soft">
                      <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                        {item.step}
                      </span>
                    </div>
                    <Card className="glass-panel flex-1">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[15px]">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {item.body}
                        </p>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ol>
            </div>

            <Card className="glass-panel mt-4">
              <CardHeader>
                <CardTitle className="text-base">Marketplace & transfer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  MINTED or TRANSFERRED credits can be listed on the BlueChain
                  Carbon Marketplace. A listing specifies a price per tonne of
                  CO₂ equivalent (tCO₂e). Buyers can browse listings by
                  ecosystem type, vintage year, and price range.
                </p>
                <p>
                  When a purchase is completed, a{" "}
                  <code className="rounded bg-muted px-1 text-xs">CreditTransfer</code>{" "}
                  record is created and the credit&apos;s{" "}
                  <code className="rounded bg-muted px-1 text-xs">ownerUserId</code>{" "}
                  is atomically updated. The listing is marked as SOLD.
                </p>
                <p>
                  Retirement is irreversible. A{" "}
                  <code className="rounded bg-muted px-1 text-xs">Retirement</code>{" "}
                  record is created with a unique{" "}
                  <code className="rounded bg-muted px-1 text-xs">certificateId</code>.
                  The on-chain retirement transaction hash is stored as{" "}
                  <code className="rounded bg-muted px-1 text-xs">txRetire</code>.
                </p>
              </CardContent>
            </Card>
          </Section>

          {/* ── 4. Blockchain ── */}
          <Section id="blockchain" icon={Lock} eyebrow="04" title="Blockchain & transparency">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="text-base">Chain anchoring</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    Approved MonitoringReports can be anchored to the Polygon
                    Amoy blockchain via the{" "}
                    <code className="rounded bg-muted px-1 text-xs">ChainAnchor</code>{" "}
                    mechanism. Each anchor records:
                  </p>
                  <ul className="list-inside list-disc space-y-1 pl-2 text-xs">
                    <li>
                      <code className="rounded bg-muted px-1">contentHash</code> — SHA-256 of the evidence bundle
                    </li>
                    <li>
                      <code className="rounded bg-muted px-1">txHash</code> — Polygon transaction hash
                    </li>
                    <li>
                      <code className="rounded bg-muted px-1">blockNumber</code> — block at which the anchor was confirmed
                    </li>
                    <li>
                      <code className="rounded bg-muted px-1">ipfsCid</code> — IPFS content identifier for the full evidence payload
                    </li>
                    <li>
                      <code className="rounded bg-muted px-1">network</code> — <span className="font-mono">polygon-amoy</span> (testnet)
                    </li>
                  </ul>
                  <p>
                    An anchor is considered confirmed once both{" "}
                    <code className="rounded bg-muted px-1 text-xs">txHash</code> and{" "}
                    <code className="rounded bg-muted px-1 text-xs">blockNumber</code>{" "}
                    are present. Pending anchors await off-chain relay confirmation.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="text-base">Smart contracts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    Three Solidity contracts are deployed to Polygon Amoy:
                  </p>
                  <ul className="list-inside list-disc space-y-1.5 pl-2">
                    <li>
                      <strong className="text-foreground">BlueCarbonRegistry</strong> — records project and report anchors with admin governance
                    </li>
                    <li>
                      <strong className="text-foreground">BlueCarbonCredit</strong> (BCC) — ERC-721 certificate for each blue carbon credit
                    </li>
                    <li>
                      <strong className="text-foreground">Retirement</strong> — irreversible burn mechanism with certificate issuance
                    </li>
                  </ul>
                  <p>
                    Contract addresses are configurable via environment variables
                    ({" "}
                    <code className="rounded bg-muted px-1 text-xs">REGISTRY_CONTRACT_ADDRESS</code>,{" "}
                    <code className="rounded bg-muted px-1 text-xs">CREDIT_CONTRACT_ADDRESS</code>,{" "}
                    <code className="rounded bg-muted px-1 text-xs">RETIREMENT_CONTRACT_ADDRESS</code>
                    {" "}). No private keys are stored in the API.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── 5. Roles ── */}
          <Section id="roles" icon={Users} eyebrow="05" title="Platform roles">
            <Card className="glass-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      <th className="p-4 text-left font-medium">Role</th>
                      <th className="p-4 text-left font-medium">Responsibilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROLES.map((r) => (
                      <tr
                        key={r.role}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="p-4 align-top">
                          <Badge
                            variant="secondary"
                            className="rounded-full font-mono text-[11px]"
                          >
                            {r.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {r.responsibilities}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Section>

          {/* ── 6. Technology ── */}
          <Section id="technology" icon={Blocks} eyebrow="06" title="Technology">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  layer: "API",
                  stack: "Node.js · Express · TypeScript · Prisma ORM",
                  detail: "RESTful JSON API with JWT authentication, role-based authorization middleware, and Zod input validation.",
                },
                {
                  layer: "Database",
                  stack: "PostgreSQL",
                  detail: "Single relational database managed by Prisma migrations. All domain models (projects, plots, observations, reports, credits) reside here.",
                },
                {
                  layer: "Frontend",
                  stack: "Next.js 15 · React 19 · Tailwind CSS",
                  detail: "Server-side rendered public pages and role-based authenticated dashboards using the Next.js App Router.",
                },
                {
                  layer: "AI service",
                  stack: "Python · FastAPI",
                  detail: "Vision quality scoring, anomaly detection, duplicate detection, and carbon sequestration estimation via dedicated microservice.",
                },
                {
                  layer: "Blockchain",
                  stack: "Solidity 0.8 · Hardhat · Polygon Amoy",
                  detail: "Smart contracts for registry anchoring, ERC-721 credit certificates, and irreversible retirement. Deployed to Polygon Amoy testnet.",
                },
                {
                  layer: "Storage",
                  stack: "IPFS · Pinata",
                  detail: "Evidence media and report bundles are content-addressed via IPFS CIDs. SHA-256 content hashes provide additional integrity guarantees.",
                },
              ].map((item) => (
                <Card key={item.layer} className="glass-panel">
                  <CardHeader className="pb-2">
                    <span className="eyebrow">{item.layer}</span>
                    <CardTitle className="text-[14px] leading-snug">
                      {item.stack}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          {/* CTA */}
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-8 text-center">
            <BookOpen
              className="mx-auto mb-4 h-8 w-8 text-primary/70"
              aria-hidden="true"
            />
            <h2 className="text-xl font-semibold tracking-tight">
              Ready to explore the registry?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse all registered blue carbon projects and their public credit
              records.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="rounded-full">
                <Link href="/registry">
                  Open registry
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
