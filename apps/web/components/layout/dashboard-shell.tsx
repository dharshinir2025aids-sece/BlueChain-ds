"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { RoleNavItem } from "@/lib/site";
import { cn } from "@/lib/utils";

export function DashboardShell({
  title,
  roleLabel,
  nav,
  children,
}: {
  title: string;
  roleLabel: string;
  nav: RoleNavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card/50 lg:flex lg:flex-col">
          <div className="flex h-[4.25rem] items-center px-5">
            <BrandMark />
          </div>
          <Separator className="opacity-60" />
          <div className="px-5 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {roleLabel}
            </p>
            <p className="mt-1.5 text-[15px] font-semibold tracking-tight">
              {title}
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-6">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== nav[0]?.href && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2 text-[13px] font-medium transition-colors duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-[4.25rem] items-center justify-between gap-3 border-b border-border/60 bg-background/75 px-4 backdrop-blur-xl sm:px-6">
            <div className="lg:hidden">
              <BrandMark showWordmark={false} />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs text-muted-foreground">Workspace</p>
              <p className="text-sm font-medium tracking-tight">{title}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/settings">Settings</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href="/">Exit</Link>
              </Button>
            </div>
          </header>

          <div className="border-b border-border/50 px-4 py-2.5 lg:hidden">
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {nav.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>

          <main className="flex-1 surface-gradient">
            <div className="container py-7 sm:py-9">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
