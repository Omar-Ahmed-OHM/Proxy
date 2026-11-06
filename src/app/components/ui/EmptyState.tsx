
import { cn } from "@/lib/cn";
import type { EmptyStateProps } from "./types";

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  bordered = true,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-8 text-center sm:py-10",
        bordered && "rounded-xl border border-dashed border-border-strong",
        className,
      )}
    >
      {icon && (
        <span className="grid size-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary-soft [&_svg]:size-5.5">
          {icon}
        </span>
      )}
      <div className="max-w-sm">
        <h3 className="text-sm font-semibold text-foreground sm:text-base">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
