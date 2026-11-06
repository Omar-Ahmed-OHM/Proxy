import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { SkeletonVariant, SkeletonProps } from "./types";

const baseClasses =
  "relative block overflow-hidden bg-muted/10 after:absolute after:inset-0 after:animate-shimmer after:bg-linear-to-r after:from-transparent after:via-white/[0.06] after:to-transparent";

const variantClasses: Record<Exclude<SkeletonVariant, "card">, string> = {
  text: "h-3.5 w-full rounded-md",
  circular: "size-10 rounded-full",
  rectangle: "h-24 w-full rounded-xl",
  avatar: "size-10 rounded-full",
  button: "h-11 w-28 rounded-xl",
  custom: "",
};

function toSize(value: number | string | undefined): string | undefined {
  return typeof value === "number" ? `${value}px` : value;
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "block rounded-card border border-border bg-card p-5 sm:p-6",
        className,
      )}
    >
      <span className="flex items-center gap-3">
        <span className={cn(baseClasses, variantClasses.avatar)} />
        <span className="flex flex-1 flex-col gap-2">
          <span className={cn(baseClasses, variantClasses.text, "w-1/2")} />
          <span className={cn(baseClasses, variantClasses.text, "h-3 w-1/3")} />
        </span>
      </span>
      <span className="mt-5 flex flex-col gap-2">
        <span className={cn(baseClasses, variantClasses.text)} />
        <span className={cn(baseClasses, variantClasses.text, "w-4/5")} />
      </span>
    </span>
  );
}

export function Skeleton({
  variant = "text",
  width,
  height,
  count = 1,
  rounded,
  className,
}: SkeletonProps) {
  const items = Array.from({ length: Math.max(1, count) }, (_, index) => index);

  if (variant === "card") {
    return (
      <span aria-hidden="true" className="flex flex-col gap-4">
        {items.map((index) => (
          <SkeletonCard key={index} className={className} />
        ))}
      </span>
    );
  }

  const style: CSSProperties = { width: toSize(width), height: toSize(height) };

  return (
    <span aria-hidden="true" className={cn("flex flex-col", variant === "text" ? "gap-2" : "gap-3")}>
      {items.map((index) => (
        <span
          key={index}
          style={style}
          className={cn(
            baseClasses,
            variantClasses[variant],
            rounded === true && "rounded-full",
            rounded === false && "rounded-none",
            variant === "text" && count > 1 && index === count - 1 && width === undefined && "w-3/5",
            className,
          )}
        />
      ))}
    </span>
  );
}
