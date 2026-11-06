import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import type { CardVariant, CardPadding, CardProps } from "./types";

const variantClasses: Record<CardVariant, string> = {
  default: "bg-card border-border shadow-card",
  elevated: "bg-elevated border-border-strong shadow-card",
  glass: "bg-card/60 border-white/10 shadow-card backdrop-blur-xl",
  interactive: "bg-card border-border shadow-card",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  as: Component = "section",
  title,
  description,
  icon,
  header,
  headerAction,
  footer,
  variant = "default",
  hoverable = false,
  clickable = false,
  padding = "md",
  className,
  children,
  onClick,
  onKeyDown,
  ...rest
}: CardProps) {
  const isHoverable = hoverable || clickable || variant === "interactive";
  const hasDefaultHeader = Boolean(title || description || icon || headerAction);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (!clickable || event.defaultPrevented) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <Component
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={clickable ? handleKeyDown : onKeyDown}
      className={cn(
        "flex min-w-0 flex-col rounded-card border",
        "transition-[border-color,box-shadow,translate,background-color] duration-200 ease-out",
        variantClasses[variant],
        isHoverable && "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-glow",
        clickable && "cursor-pointer active:translate-y-0",
        paddingClasses[padding],
        className,
      )}
      {...rest}
    >
      {header ??
        (hasDefaultHeader && (
          <header className="mb-4 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              {icon && (
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary-soft [&_svg]:size-4.5">
                  {icon}
                </span>
              )}
              <div className="min-w-0">
                {title && <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>}
                {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
              </div>
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </header>
        ))}
      {children !== undefined && <div className="min-w-0 flex-1">{children}</div>}
      {footer && (
        <footer className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
          {footer}
        </footer>
      )}
    </Component>
  );
}
