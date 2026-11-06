import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ViewAllLinkProps } from "../types";

export function ViewAllLink({ href, label }: ViewAllLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group inline-flex items-center gap-1 rounded-md text-sm font-medium text-secondary transition-colors hover:text-accent"
    >
      View All
      <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
