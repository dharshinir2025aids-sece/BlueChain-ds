import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 surface-gradient px-4 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        The page you requested is not part of the BlueChain MRV platform.
      </p>
      <Button asChild className="rounded-full">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
