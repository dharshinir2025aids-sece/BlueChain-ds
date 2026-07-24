import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { siteConfig } from "@/lib/site";

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Public Registry", href: "/registry" },
      { label: "GIS Explorer", href: "/map" },
      { label: "Documentation", href: "/docs" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Workspaces",
    links: [
      { label: "Field Worker", href: "/field" },
      { label: "NGO Manager", href: "/ngo" },
      { label: "Verifier", href: "/verifier" },
      { label: "NCCR Admin", href: "/admin" },
    ],
  },
  {
    title: "Access",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Register", href: "/register" },
      { label: "Buyer Portal", href: "/buyer" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="relative border-t border-border/60 bg-muted/40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm space-y-5">
            <BrandMark />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Built for Smart India Hackathon
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {column.title}
                </p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/80 transition-colors duration-200 hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container flex flex-col gap-3 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. National blue carbon
            registry prototype.
          </p>
          <p className="font-medium text-foreground/60">
            Transparent · Verifiable · Government-ready
          </p>
        </div>
      </div>
    </footer>
  );
}
