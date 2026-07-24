import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export function BrandMark({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label={siteConfig.name}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-accent text-[11px] font-semibold tracking-tight text-white shadow-sm transition-opacity group-hover:opacity-90">
        BC
      </span>
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            {siteConfig.shortName}
          </span>
          <span className="mt-0.5 text-[10px] font-medium tracking-[0.12em] text-muted-foreground">
            MRV PLATFORM
          </span>
        </span>
      ) : null}
    </Link>
  );
}
