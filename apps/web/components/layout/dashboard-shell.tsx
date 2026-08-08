"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
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
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  // Derive initials from name or fallback to role initial
  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : roleLabel.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* ── Desktop sidebar ─────────────────────────────────────────── */}
        <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card/50 lg:flex lg:flex-col">
          <div className="flex h-[4.25rem] items-center px-5">
            <BrandMark />
          </div>
          <Separator className="opacity-60" />

          {/* Role / workspace label */}
          <div className="px-5 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {roleLabel}
            </p>
            <p className="mt-1.5 text-[15px] font-semibold tracking-tight">
              {title}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-4">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== nav[0]?.href &&
                  pathname.startsWith(item.href));
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

          <Separator className="opacity-60" />

          {/* User card at bottom of sidebar */}
          <div className="px-3 py-4">
            {user ? (
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                {/* Avatar */}
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-accent/80 text-[11px] font-semibold text-white"
                  aria-hidden="true"
                >
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight">
                    {user.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-2 flex gap-1.5">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="flex-1 justify-start rounded-lg text-[12px] text-muted-foreground hover:text-foreground"
              >
                <Link href="/settings">
                  <Settings className="mr-1.5 h-3.5 w-3.5" />
                  Settings
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start rounded-lg text-[12px] text-muted-foreground hover:text-destructive"
                onClick={handleLogout}
                aria-label="Sign out"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top header */}
          <header className="sticky top-0 z-40 flex h-[4.25rem] items-center justify-between gap-3 border-b border-border/60 bg-background/75 px-4 backdrop-blur-xl sm:px-6">
            {/* Mobile: show logo */}
            <div className="lg:hidden">
              <BrandMark showWordmark={false} />
            </div>

            {/* Desktop: workspace breadcrumb */}
            <div className="hidden lg:block">
              <p className="text-xs text-muted-foreground">Workspace</p>
              <p className="text-sm font-medium tracking-tight">{title}</p>
            </div>

            {/* Header right: actions */}
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />

              {/* Desktop user avatar pill */}
              {user ? (
                <div className="hidden items-center gap-2 lg:flex">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-accent/80 text-[11px] font-semibold text-white"
                    aria-label={`Signed in as ${user.name}`}
                  >
                    {initials}
                  </span>
                </div>
              ) : null}

              <Button
                variant="ghost"
                size="sm"
                className="hidden rounded-full text-muted-foreground hover:text-destructive lg:inline-flex"
                onClick={handleLogout}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>

              {/* Mobile: sign out */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-full lg:hidden"
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </div>
          </header>

          {/* Mobile horizontal nav strip */}
          <div className="border-b border-border/50 px-4 py-2.5 lg:hidden">
            <div
              className="flex gap-1.5 overflow-x-auto pb-0.5"
              role="navigation"
              aria-label="Section navigation"
            >
              {nav.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
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

          {/* Page content */}
          <main className="flex-1 surface-gradient">
            <div className="container py-7 sm:py-9">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
