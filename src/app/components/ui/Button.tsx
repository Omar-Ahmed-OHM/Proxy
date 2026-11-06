
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";
import type { ButtonVariant, ButtonSize, ButtonProps, ButtonStyleOptions } from "./types";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-linear-to-r from-primary to-primary-end text-white shadow-sm shadow-primary/25 hover:from-primary-hover hover:to-primary hover:shadow-glow",
  secondary:
    "bg-elevated text-foreground border border-border-strong hover:bg-elevated-hover hover:border-secondary/40",
  outline:
    "bg-transparent text-foreground border border-border-strong hover:border-primary/60 hover:bg-primary/10",
  ghost: "bg-transparent text-muted hover:bg-elevated hover:text-foreground",
  danger:
    "bg-danger/15 text-danger border border-danger/40 hover:bg-danger hover:text-canvas hover:border-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "size-11 rounded-xl",
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: "size-9 rounded-lg",
  md: "size-11 rounded-xl",
  lg: "size-12 rounded-xl",
  icon: "size-11 rounded-xl",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "relative inline-flex shrink-0 select-none items-center justify-center font-medium leading-none whitespace-nowrap",
    "transition-[color,background-color,border-color,box-shadow,translate,scale] duration-150 ease-out",
    "not-disabled:hover:-translate-y-px not-disabled:active:translate-y-0 not-disabled:active:scale-[0.98]",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait",
    "[&_svg]:shrink-0",
    variantClasses[variant],
    iconOnly || size === "icon" ? iconOnlySizeClasses[size] : sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

const spinnerSize: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18, icon: 18 };

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  disabled,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  const spinner = <Spinner size={spinnerSize[size]} label="" />;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, fullWidth, iconOnly, className })}
      {...rest}
    >
      {iconOnly ? (
        loading ? spinner : children
      ) : (
        <>
          {loading ? spinner : leftIcon}
          {children}
          {!loading && rightIcon}
        </>
      )}
    </button>
  );
}
