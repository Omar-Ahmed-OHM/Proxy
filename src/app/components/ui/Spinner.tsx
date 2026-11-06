import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SpinnerProps } from "./types";

export function Spinner({ size = 16, label = "Loading", className }: SpinnerProps) {
  return (
    <span role={label ? "status" : undefined} className={cn("inline-flex", className)}>
      <LoaderCircle size={size} className="animate-spin" aria-hidden="true" />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
