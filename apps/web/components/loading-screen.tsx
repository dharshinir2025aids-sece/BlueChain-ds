"use client";

import * as React from "react";
import { siteConfig } from "@/lib/site";

export function LoadingScreen({ label = "Loading" }: { label?: string }) {
  // Animate a progress bar from 0 → ~85 % during mount,
  // then let it sit just below 100 % so the parent can unmount cleanly.
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    // Step 1 — fast jump to 40 %
    const t1 = window.setTimeout(() => setProgress(40), 60);
    // Step 2 — ease to 72 %
    const t2 = window.setTimeout(() => setProgress(72), 200);
    // Step 3 — settle at 88 %
    const t3 = window.setTimeout(() => setProgress(88), 380);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label={`${siteConfig.name} — ${label}`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Brand mark */}
        <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white shadow-soft">
          BC
        </div>

        {/* Label */}
        <div className="text-center">
          <p className="text-sm font-semibold tracking-tight">
            {siteConfig.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>

        {/* Animated progress bar */}
        <div
          className="h-0.5 w-28 overflow-hidden rounded-full bg-muted"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-primary/70 transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
