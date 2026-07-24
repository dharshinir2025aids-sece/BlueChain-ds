"use client";

import * as React from "react";
import { LoadingScreen } from "@/components/loading-screen";

/** Short, quiet boot splash — no heavy motion. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = React.useState(true);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {booting ? <LoadingScreen /> : null}
      <div
        className={
          booting
            ? "pointer-events-none opacity-0"
            : "opacity-100 transition-opacity duration-200"
        }
      >
        {children}
      </div>
    </>
  );
}
