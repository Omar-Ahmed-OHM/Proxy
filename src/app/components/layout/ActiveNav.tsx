"use client";

import { usePathname } from "next/navigation";
import { NavItems } from "./NavItems";
import type { ActiveNavProps } from "./types";

export function ActiveNav({ layout }: ActiveNavProps) {
  const pathname = usePathname();
  return <NavItems layout={layout} pathname={pathname} />;
}
