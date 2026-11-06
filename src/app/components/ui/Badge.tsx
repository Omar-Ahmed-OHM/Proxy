
import { cn } from "@/lib/cn";
import type { BadgeVariant, BadgeSize, BadgeProps } from "./types";

const variantClasses: Record<BadgeVariant, { badge: string; dot: string }> = {
  default: { badge: "bg-elevated text-muted border-border-strong", dot: "bg-muted" },
  primary: { badge: "bg-primary/15 text-primary-soft border-primary/30", dot: "bg-primary-soft" },
  success: { badge: "bg-success/10 text-success border-success/25", dot: "bg-success" },
  warning: { badge: "bg-warning/10 text-warning border-warning/25", dot: "bg-warning" },
  danger: { badge: "bg-danger/10 text-danger border-danger/25", dot: "bg-danger" },
  info: { badge: "bg-secondary/10 text-secondary border-secondary/25", dot: "bg-secondary" },
  accent: { badge: "bg-accent/10 text-accent border-accent/25", dot: "bg-accent" },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "h-5 px-1.5 text-[0.6875rem] gap-1 [&_svg]:size-3",
  md: "h-6 px-2 text-xs gap-1.5 [&_svg]:size-3.5",
  lg: "h-7 px-2.5 text-sm gap-1.5 [&_svg]:size-4",
};

export function Badge({
  variant = "default",
  size = "md",
  icon,
  dot = false,
  pill = false,
  className,
  children,
}: BadgeProps) {
  const styles = variantClasses[variant];

  return (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 items-center border font-medium leading-none whitespace-nowrap [&_svg]:shrink-0",
        pill ? "rounded-full" : "rounded-md",
        styles.badge,
        sizeClasses[size],
        className,
      )}
    >
      {dot && <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} />}
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}
