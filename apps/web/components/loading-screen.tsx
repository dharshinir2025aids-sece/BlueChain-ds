"use client";

import { siteConfig } from "@/lib/site";

export function LoadingScreen({ label = "Loading" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white shadow-soft">
          BC
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold tracking-tight">{siteConfig.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
        <div className="h-0.5 w-28 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-primary/70" />
        </div>
      </div>
    </div>
  );
}
