import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Database,
  Eye,
  Globe2,
  Leaf,
  Lock,
  ShieldCheck,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "About BlueChain MRV" };

// ─── Workflow step ────────────────────────────────────────────────────────────

function WorkflowStep({
  step,
  title,
  body,
  last,
}: {
  step: string;
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-5">
      {/* Connector line */}
      {!last && (
        <div className="absolute left-[1.35rem] top-12 h-[calc(100%-1.25rem)] w-px bg-gradient-to-b from-primary/40 to-transparent" />
      )}
      <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-primary shadow-soft">
        {step}
      </div>
      <div className="glass-panel mb-3 flex-1 p-5">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="surface-gradient">
      {/* ── Hero ── */}
      <section className="container py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Waves className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Smart India Hackathon — Government prototype
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            BlueChain MRV
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Government-grade blue carbon registry and Monitoring, Reporting &
            Verification platform for India&apos;s coastal ecosystems —
            transparent, verifiable, and audit-ready from field evidence to
            blockchain-secured carbon credits.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/registry">
                Open registry
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full"
            >
              <Link href="/docs">Read documentation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="container py-12">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow mb-4">Mission</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Trusted blue carbon accounting at national scale
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
            India&apos;s coastal ecosystems — mangroves, seagrasses, and salt
            marshes — sequester carbon at rates far higher than terrestrial
            forests. Yet the absence of a standardised, auditable MRV platform
            means this sequestration goes largely unrecognised in national and
            international climate accounting.
          </p>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
            BlueChain provides the digital infrastructure to change that: a
            complete workflow from GPS-tagged field observation to
            blockchain-anchored carbon certificate, with every step recorded,
            verifiable, and publicly inspectable.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Eye,
                title: "Transparent",
                body: "Every project, report, and credit record is publicly accessible in the registry without requiring an account.",
              },
              {
                icon: ShieldCheck,
                title: "Verifiable",
                body: "Independent verifiers review evidence packages against defined standards before any credit can be issued.",
              },
              {
                icon: Database,
                title: "Audit-ready",
                body: "A complete, immutable audit trail covers the full lifecycle from field observation to retirement certificate.",
              },
              {
                icon: Lock,
                title: "Blockchain-secured",
                body: "Approved reports and issued credits are anchored to the Polygon Amoy blockchain with content-hash proofs.",
              },
            ].map((item) => (
              <Card key={item.title} className="glass-panel hover-lift">
                <CardHeader className="pb-3">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <CardTitle className="text-[15px]">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ecosystems ── */}
      <section className="border-y border-border/60 bg-card/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <p className="eyebrow mb-4">Ecosystems</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Three coastal ecosystem types
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              BlueChain targets the three primary blue carbon ecosystem types
              present along India&apos;s 7,516 km coastline.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {[
                {
                  emoji: "🌿",
                  type: "MANGROVE",
                  title: "Mangroves",
                  description:
                    "Tidal forest ecosystems that sequester carbon in both biomass and deep sediment layers. India hosts 4,992 km² of mangrove cover across the Sundarbans, Gulf of Kachchh, Pichavaram, and other sites.",
                  co2note: "Up to 6× more carbon per hectare than tropical forests",
                  color: "from-emerald-500/20 to-emerald-500/5",
                  borderColor: "border-emerald-500/30",
                  textColor: "text-emerald-700 dark:text-emerald-400",
                },
                {
                  emoji: "🌊",
                  type: "SEAGRASS",
                  title: "Seagrass beds",
                  description:
                    "Submerged flowering plant meadows that trap fine sediment and accumulate organic carbon below the seabed. Found in the Gulf of Mannar, Palk Bay, and Lakshadweep.",
                  co2note: "Stores 830 Tg of organic carbon globally",
                  color: "from-cyan-500/20 to-cyan-500/5",
                  borderColor: "border-cyan-500/30",
                  textColor: "text-cyan-700 dark:text-cyan-400",
                },
                {
                  emoji: "🦢",
                  type: "SALT_MARSH",
                  title: "Salt marshes",
                  description:
                    "Vegetated coastal wetlands at the interface of land and sea. Long-term carbon accumulation in anaerobic peat soils. Present in the Mahanadi Delta, Sundarbans fringe, and Gujarat coast.",
                  co2note: "Accumulates carbon over centuries in stable peat",
                  color: "from-teal-500/20 to-teal-500/5",
                  borderColor: "border-teal-500/30",
                  textColor: "text-teal-700 dark:text-teal-400",
                },
              ].map((eco) => (
                <div
                  key={eco.type}
                  className={`rounded-2xl border ${eco.borderColor} bg-gradient-to-b ${eco.color} p-6`}
                >
                  <span className="text-4xl" aria-hidden="true">
                    {eco.emoji}
                  </span>
                  <h3 className="mt-3 text-[17px] font-semibold">
                    {eco.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {eco.description}
                  </p>
                  <p
                    className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${eco.textColor}`}
                  >
                    <Leaf className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {eco.co2note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section className="container py-16">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-4">Platform workflow</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            From field data to retired credit
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            A disciplined pipeline that keeps field teams, NGOs, verifiers,
            government admins, and buyers aligned and accountable at every step.
          </p>

          <ol className="mt-10 space-y-0">
            {[
              {
                step: "01",
                title: "Field data collection",
                body: "Field workers capture GPS-tagged observations — biomass surveys, water quality measurements, photo surveys, and sensor readings — directly linked to registered monitoring plots.",
              },
              {
                step: "02",
                title: "Monitoring report compilation",
                body: "NGO Managers aggregate approved observations into a structured Monitoring Report covering a defined period. The evidence bundle is content-hashed and optionally stored on IPFS.",
              },
              {
                step: "03",
                title: "Independent verification",
                body: "An accredited Verifier reviews the evidence package and records a decision (Approved, Rejected, or Changes Requested). The full audit trail is preserved.",
              },
              {
                step: "04",
                title: "NCCR authorisation",
                body: "The National Climate Change Registry Admin reviews the verification decision and authorises issuance of carbon credits proportional to verified sequestration.",
              },
              {
                step: "05",
                title: "Credit issuance & blockchain anchor",
                body: "Credits are minted as database records and the MonitoringReport is anchored to the Polygon Amoy blockchain with a content-hash proof. Token IDs are assigned on-chain.",
              },
              {
                step: "06",
                title: "Marketplace listing & purchase",
                body: "Credit owners (NGOs, the registry) list credits on the Carbon Marketplace. Corporate buyers browse by ecosystem type, vintage year, and price. Purchases atomically transfer ownership.",
              },
              {
                step: "07",
                title: "Retirement",
                body: "Buyers retire credits against their ESG commitments. Retirement is irreversible — a unique certificate is issued and the on-chain retirement transaction hash is recorded.",
                last: true,
              },
            ].map((s) => (
              <WorkflowStep
                key={s.step}
                step={s.step}
                title={s.title}
                body={s.body}
                last={s.last}
              />
            ))}
          </ol>
        </div>
      </section>

      {/* ── SIH alignment ── */}
      <section className="border-t border-border/60 bg-card/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow mb-4">SIH Alignment</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Designed for government-scale deployment
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              BlueChain MRV was designed as a Smart India Hackathon prototype for
              national-scale blue carbon monitoring and verification. It
              demonstrates the full technical stack required for a
              production-grade deployment by the Ministry of Environment, Forest
              and Climate Change or the National Climate Change Registry.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Globe2,
                  label: "National registry-ready",
                  detail:
                    "Role-based access covers field teams through government administrators — no custom integration required.",
                },
                {
                  icon: BadgeCheck,
                  label: "Standards-aligned",
                  detail:
                    "MRV workflow follows the evidence and approval chain required by international blue carbon methodologies.",
                },
                {
                  icon: Blocks,
                  label: "Audit-trail complete",
                  detail:
                    "Every state transition across the entire system is logged in an immutable AuditLog. On-chain anchors provide external verification.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="glass-panel rounded-2xl p-5"
                >
                  <item.icon
                    className="mb-3 h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  <p className="text-[14px] font-semibold">{item.label}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              BlueChain MRV is a prototype. It is not currently deployed in
              production or used by any government agency. All project and credit
              data shown in the registry is for demonstration purposes.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Explore the platform
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Browse the public registry, read the documentation, or register for
            a role-based workspace.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full">
              <Link href="/registry">
                Open registry
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/docs">Documentation</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
