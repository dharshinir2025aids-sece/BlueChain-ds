import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen surface-gradient">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Back home
        </Link>
      </div>
      <div className="container flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <BrandMark />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
