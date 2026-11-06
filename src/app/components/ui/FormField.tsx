
import { cn } from "@/lib/cn";
import type { ControlSize, ControlStyleOptions, FormFieldProps } from "./types";

export const controlHeights: Record<ControlSize, string> = {
  sm: "h-10",
  md: "h-11",
};

export function controlStyles({ invalid = false, className }: ControlStyleOptions = {}): string {
  return cn(
    "w-full min-w-0 rounded-xl border bg-surface text-sm text-foreground placeholder:text-muted/60",
    "transition-[border-color,box-shadow,background-color] duration-150",
    "outline-none focus-visible:outline-none focus:ring-4",
    "disabled:cursor-not-allowed disabled:opacity-50",
    invalid
      ? "border-danger/60 focus:border-danger focus:ring-danger/15"
      : "border-border-strong not-disabled:hover:border-muted/40 focus:border-primary/70 focus:ring-primary/20",
    className,
  );
}

export function fieldMessageId(id: string): string {
  return `${id}-message`;
}

export function FormField({
  id,
  label,
  required = false,
  helperText,
  error,
  meta,
  className,
  children,
}: FormFieldProps) {
  const message = error ?? helperText;

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {(message || meta) && (
        <div className="flex items-start justify-between gap-3 text-xs">
          {message ? (
            <p id={fieldMessageId(id)} className={error ? "text-danger" : "text-muted"}>
              {message}
            </p>
          ) : (
            <span />
          )}
          {meta}
        </div>
      )}
    </div>
  );
}
