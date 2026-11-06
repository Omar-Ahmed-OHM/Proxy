"use client";

import { useId } from "react";
import { useControllableState } from "@/hooks/useControllableState";
import { cn } from "@/lib/cn";
import type { SwitchSize, SwitchProps } from "./types";

const trackSize: Record<SwitchSize, string> = {
  sm: "h-5 w-9",
  md: "h-6 w-11",
};

const thumbSize: Record<SwitchSize, { base: string; on: string }> = {
  sm: { base: "size-4", on: "translate-x-4" },
  md: { base: "size-5", on: "translate-x-5" },
};

export function Switch({
  label,
  description,
  checked: checkedProp,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = "md",
  id,
  name,
  "aria-label": ariaLabel,
  className,
}: SwitchProps) {
  const generatedId = useId();
  const switchId = id ?? generatedId;
  const descriptionId = description ? `${switchId}-description` : undefined;
  const [checked, setChecked] = useControllableState(checkedProp, defaultChecked, onChange);

  const control = (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={descriptionId}
      aria-label={label ? undefined : ariaLabel}
      disabled={disabled}
      onClick={() => setChecked(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border p-0.5",
        "transition-[background-color,border-color] duration-200 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "border-primary bg-linear-to-r from-primary to-secondary"
          : "border-border-strong bg-surface hover:border-muted/40",
        trackSize[size],
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "rounded-full bg-foreground shadow-sm transition-[translate,background-color] duration-200 ease-out",
          thumbSize[size].base,
          checked ? cn(thumbSize[size].on, "bg-white") : "translate-x-0 bg-muted",
        )}
      />
    </button>
  );

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      {(label || description) && (
        <div className={cn("min-w-0", disabled && "opacity-50")}>
          {label && (
            <label
              htmlFor={switchId}
              className={cn(
                "block text-sm font-medium text-foreground",
                disabled ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p id={descriptionId} className="mt-0.5 text-sm text-muted">
              {description}
            </p>
          )}
        </div>
      )}
      {control}
      {name && <input type="hidden" name={name} value={checked ? "on" : "off"} />}
    </div>
  );
}
