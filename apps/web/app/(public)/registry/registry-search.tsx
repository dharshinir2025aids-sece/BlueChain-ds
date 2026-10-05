"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ECOSYSTEM_OPTIONS = [
  { value: "", label: "All ecosystems" },
  { value: "MANGROVE", label: "Mangrove" },
  { value: "SEAGRASS", label: "Seagrass" },
  { value: "SALT_MARSH", label: "Salt Marsh" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "VERIFIED", label: "Verified" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "DRAFT", label: "Draft" },
];

export function RegistrySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
  const [ecosystem, setEcosystem] = React.useState(
    searchParams.get("ecosystemType") ?? "",
  );
  const [status, setStatus] = React.useState(searchParams.get("status") ?? "");

  const hasFilters = Boolean(search || ecosystem || status);

  // Debounced search update
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (ecosystem) params.set("ecosystemType", ecosystem);
      if (status) params.set("status", status);
      const suffix = params.toString() ? `?${params.toString()}` : "";
      router.replace(`${pathname}${suffix}`, { scroll: false });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, ecosystem, status, pathname, router]);

  function clearAll() {
    setSearch("");
    setEcosystem("");
    setStatus("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="mb-7 space-y-3">
      {/* Search input */}
      <div className="relative max-w-lg">
        <Search
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search projects by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4"
          aria-label="Search projects"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal
          className="h-3.5 w-3.5 text-muted-foreground"
          aria-hidden="true"
        />

        {/* Ecosystem filter */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by ecosystem">
          {ECOSYSTEM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setEcosystem(opt.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150",
                ecosystem === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="text-border" aria-hidden="true">|</span>

        {/* Status filter */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150",
                status === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-7 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={clearAll}
            aria-label="Clear all filters"
          >
            <X className="mr-1 h-3 w-3" aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
