import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { Sparkline } from "./Sparkline";
import type { StatCardProps, StatCardTone, StatCardVariant, TrendDirection } from "./types";

const iconClasses: Record<StatCardVariant, string> = {
  default: "bg-elevated-hover text-muted border-border-strong",
  primary: "bg-primary/15 text-primary-soft border-primary/25",
  info: "bg-secondary/10 text-secondary border-secondary/25",
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/10 text-warning border-warning/25",
  danger: "bg-danger/10 text-danger border-danger/25",
};

const toneClasses: Record<StatCardTone, { card: string; badge: string; line: string }> = {
  primary: {
    card: "border-primary/35 from-primary/40 via-primary/15 to-card",
    badge: "bg-linear-to-br from-primary to-primary-end shadow-glow",
    line: "text-primary-soft",
  },
  secondary: {
    card: "border-secondary/30 from-secondary/30 via-secondary/10 to-card",
    badge: "bg-linear-to-br from-secondary to-[#0b7fd6] shadow-glow-blue",
    line: "text-secondary",
  },
  success: {
    card: "border-success/30 from-success/25 via-success/10 to-card",
    badge: "bg-linear-to-br from-success to-[#0ea57b] shadow-[0_0_24px_-4px_rgb(23_214_160/0.6)]",
    line: "text-success",
  },
  warning: {
    card: "border-warning/30 from-warning/25 via-warning/10 to-card",
    badge: "bg-linear-to-br from-warning to-[#ff7a1a] shadow-[0_0_24px_-4px_rgb(255_170_54/0.6)]",
    line: "text-warning",
  },
};

const trendIcons: Record<TrendDirection, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendLabels: Record<TrendDirection, string> = {
  up: "Up",
  down: "Down",
  neutral: "No change",
};

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  trendDirection = "neutral",
  invertTrend = false,
  variant = "primary",
  tone,
  sparkline,
  loading = false,
  className,
}: StatCardProps) {
  const positive = invertTrend ? trendDirection === "down" : trendDirection === "up";
  const negative = invertTrend ? trendDirection === "up" : trendDirection === "down";
  const TrendIcon = trendIcons[trendDirection];

  if (tone) {
    const styles = toneClasses[tone];

    return (
      <section
        aria-busy={loading || undefined}
        className={cn(
          "relative flex min-w-0 items-center gap-4 overflow-hidden rounded-card border bg-linear-to-br p-4 shadow-card sm:p-5",
          styles.card,
          className,
        )}
      >
        {icon && (
          <span
            aria-hidden="true"
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-full text-white sm:size-14 [&_svg]:size-6 sm:[&_svg]:size-7",
              styles.badge,
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton variant="custom" className="h-8 w-16 rounded-lg" />
              <Skeleton variant="text" className="h-3 w-24" />
              <Skeleton variant="text" className="h-3 w-12" />
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">{value}</p>
              <h3 className="mt-0.5 truncate text-sm font-medium text-foreground/85">{title}</h3>
              {trendValue && (
                <p
                  className={cn(
                    "mt-1.5 inline-flex items-center gap-1 text-xs font-semibold",
                    positive && "text-success",
                    negative && "text-danger",
                    !positive && !negative && "text-muted",
                  )}
                >
                  <TrendIcon size={13} aria-hidden="true" />
                  <span className="sr-only">{trendLabels[trendDirection]}</span>
                  {trendValue}
                  {trend && <span className="font-normal text-muted">{trend}</span>}
                </p>
              )}
              {description && <p className="mt-1 text-xs text-muted">{description}</p>}
            </>
          )}
        </div>
        {!loading && sparkline && sparkline.length > 1 && (
          <Sparkline data={sparkline} className={cn("absolute right-4 bottom-4 hidden sm:block", styles.line)} />
        )}
      </section>
    );
  }

  return (
    <Card variant="elevated" padding="sm" aria-busy={loading || undefined} className={cn("sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-medium text-muted">{title}</p>
        {icon && (
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl border [&_svg]:size-4.5",
              iconClasses[variant],
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-3 flex flex-col gap-2">
          <Skeleton variant="custom" className="h-8 w-24 rounded-lg" />
          <Skeleton variant="text" className="h-3 w-32" />
        </div>
      ) : (
        <>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">{value}</p>
            {sparkline && sparkline.length > 1 && (
              <Sparkline data={sparkline} width={80} height={28} className={iconClasses[variant].split(" ")[1]} />
            )}
          </div>
          {(trendValue || trend || description) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              {trendValue && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium",
                    positive && "bg-success/10 text-success",
                    negative && "bg-danger/10 text-danger",
                    !positive && !negative && "bg-elevated-hover text-muted",
                  )}
                >
                  <TrendIcon size={12} aria-hidden="true" />
                  <span className="sr-only">{trendLabels[trendDirection]}</span>
                  {trendValue}
                </span>
              )}
              {trend && <span className="text-muted">{trend}</span>}
              {description && !trend && <span className="text-muted">{description}</span>}
            </div>
          )}
          {description && trend && <p className="mt-1.5 text-xs text-muted">{description}</p>}
        </>
      )}
    </Card>
  );
}
