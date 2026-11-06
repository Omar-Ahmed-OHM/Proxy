import { Suspense } from "react";
import { ActiveNav } from "./ActiveNav";
import { NavItems } from "./NavItems";
import type { PrimaryNavProps } from "./types";

export function PrimaryNav({ layout, className }: PrimaryNavProps) {
  return (
    <nav aria-label="Primary" className={className}>
      <Suspense fallback={<NavItems layout={layout} pathname={null} />}>
        <ActiveNav layout={layout} />
      </Suspense>
    </nav>
  );
}
