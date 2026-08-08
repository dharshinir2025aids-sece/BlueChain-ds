import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 surface-gradient px-4 text-center">
      <BrandMark />

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          This page doesn&apos;t exist in the BlueChain MRV platform. Check the
          URL or return to the dashboard.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild className="rounded-full" size="lg">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Return home
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full" size="lg">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
