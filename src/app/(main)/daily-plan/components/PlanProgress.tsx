import type { PlanProgressProps } from "../types";

export function PlanProgress({ completed, total }: PlanProgressProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span id="plan-progress-label" className="font-medium text-foreground">
          Progress
        </span>
        <span className="text-muted">
          <span className="font-semibold text-foreground">{completed}</span> of {total} done · {percent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-labelledby="plan-progress-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2.5 overflow-hidden rounded-full bg-elevated"
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-primary to-secondary transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
