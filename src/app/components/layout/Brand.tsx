import Link from "next/link";
import { cn } from "@/lib/cn";
import type { BrandProps } from "./types";

export function Brand({ collapsible = false, className }: BrandProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-3 rounded-xl", className)} aria-label="Proxy home">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-primary via-primary-end to-secondary text-xl font-black text-white shadow-glow"
      >
        P
      </span>
      <span
        className={cn(
          "text-2xl font-bold tracking-tight text-foreground",
          collapsible && "md:hidden lg:inline",
        )}
      >
        Proxy
      </span>
    </Link>
  );
}
