import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileSearch,
  Globe2,
  Leaf,
  Lock,
  MapPinned,
  ShieldCheck,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const stats = [
  { value: "3", label: "Ecosystem types", hint: "Mangrove · Seagrass · Marsh" },
  { value: "6", label: "Stakeholder roles", hint: "Field to NCCR Admin" },
  { value: "100%", label: "Audit trail", hint: "IPFS + on-chain anchors" },
  { value: "SIH", label: "Ready", hint: "Enterprise demo quality" },
];

const features = [
  {
    icon: MapPinned,
    title: "GIS-first monitoring",
    description:
      "Coastal project boundaries, plot markers, and spatial evidence on OpenStreetMap — built for national oversight.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-stage MRV",
    description:
      "Field capture, NGO reporting, independent verification, and NCCR authorization in one controlled workflow.",
  },
  {
    icon: Lock,
    title: "Blockchain registry",
    description:
      "Immutable anchors and blue carbon certificates on Polygon Amoy with transparent mint and retirement.",
  },
  {
    icon: FileSearch,
    title: "AI-assisted review",
    description:
      "Quality checks and anomaly flags that help verifiers focus — humans remain in the decision loop.",
  },
  {
    icon: Globe2,
    title: "Public transparency",
    description:
      "Citizens and researchers can browse verified projects, proofs, and retired credits without friction.",
  },
  {
    icon: Leaf,
    title: "Credit lifecycle",
    description:
      "From verified sequestration to corporate retirement certificates — end-to-end blue carbon accounting.",
  },
];

const timeline = [
  {
    step: "01",
    title: "Register & map",
    body: "NGOs create restoration projects with geo-boundaries, methodology tags, and plot definitions.",
  },
  {
    step: "02",
    title: "Monitor in the field",
    body: "Field workers capture observations, media, and sensor readings with GPS-linked evidence packs.",
  },
  {
    step: "03",
    title: "Verify & authorize",
    body: "Independent verifiers review packages; NCCR admins authorize credit eligibility for the national registry.",
  },
  {
    step: "04",
    title: "Mint, transfer, retire",
    body: "Verified tonnes become auditable credits — transferable to buyers and irreversibly retired for ESG claims.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden surface-gradient">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,hsl(var(--background)))]" />
        <div className="container relative pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur-md">
              <Waves className="h-3.5 w-3.5 text-primary" />
              National Blue Carbon Registry · SIH
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {siteConfig.name}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A government-grade platform for Monitoring, Reporting & Verification
              of blue carbon ecosystems — from coastal field evidence to
              blockchain-secured carbon credits.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-[160px] rounded-full">
                <Link href="/register">
                  Enter platform
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-[160px] rounded-full bg-background/60 backdrop-blur"
              >
                <Link href="/registry">View registry</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                Role-based access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                Audit-ready MRV
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                Polygon Amoy ready
              </span>
            </div>
          </div>

          {/* Hero product frame */}
          <div className="mx-auto mt-14 max-w-5xl">
            <div className="glass-panel overflow-hidden p-2 sm:p-3">
              <div className="rounded-[14px] border border-border/60 bg-gradient-to-b from-secondary/80 to-background p-5 sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      National overview
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      Blue carbon programme dashboard
                    </p>
                  </div>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    Live preview
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Verified area", value: "— ha" },
                    { label: "Credits minted", value: "— tCO₂e" },
                    { label: "Active projects", value: "—" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-soft"
                    >
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 h-36 rounded-2xl border border-dashed border-border/80 bg-muted/40 sm:h-44" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-background">
        <div className="container py-12 sm:py-14">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-colors duration-200 hover:border-primary/25"
              >
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">{stat.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-pad surface-gradient">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Capabilities</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for national climate governance
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Every module is designed for clarity, accountability, and scale —
              the standard expected of a government enterprise product.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="hover-lift group rounded-2xl border border-border/70 bg-card/90 p-6 shadow-soft backdrop-blur-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-pad border-t border-border/60">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              From restoration site to retired credit
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              A disciplined pipeline that keeps communities, NGOs, verifiers, and
              administrators aligned.
            </p>
          </div>

          <div className="relative mx-auto mt-14 max-w-3xl">
            <div className="absolute bottom-2 left-[1.15rem] top-2 w-px bg-gradient-to-b from-primary/40 via-border to-accent/40 sm:left-[1.35rem]" />
            <ol className="space-y-5">
              {timeline.map((item) => (
                <li key={item.step} className="relative flex gap-4 sm:gap-5">
                  <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-primary shadow-soft sm:h-11 sm:w-11 sm:text-sm">
                    {item.step}
                  </div>
                  <div className="glass-panel flex-1 p-5 sm:p-6">
                    <h3 className="text-[15px] font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 sm:pb-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary/[0.08] via-card to-accent/[0.08] p-8 shadow-soft sm:p-12 lg:p-14">
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready for SIH finals demonstration
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Explore role workspaces, the public registry, and the national
                map — a clean foundation for a production-grade climate registry.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/admin">
                    Open admin console
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/docs">Read documentation</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
