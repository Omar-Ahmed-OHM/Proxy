"use client";

import { Check, Minus } from "lucide-react";
import { useEffect, useId, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/cn";
import type { CheckboxProps } from "./types";

export function Checkbox({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled,
  indeterminate = false,
  required,
  id,
  className,
  ref,
  ...rest
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const Icon = indeterminate ? Minus : Check;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          ref={inputRef}
          id={inputId}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={(event) => onChange?.(event.target.checked, event)}
          disabled={disabled}
          required={required}
          aria-describedby={descriptionId}
          aria-checked={indeterminate ? "mixed" : undefined}
          className="peer absolute inset-0 z-10 m-0 cursor-pointer appearance-none rounded-md outline-none focus-visible:outline-none disabled:cursor-not-allowed"
          {...rest}
        />
        <span
          aria-hidden="true"
          className={cn(
            "grid size-5 place-items-center rounded-md border border-border-strong bg-surface text-white",
            "transition-[background-color,border-color,box-shadow] duration-150",
            "peer-hover:border-primary/60 peer-checked:border-primary peer-checked:bg-primary peer-indeterminate:border-primary peer-indeterminate:bg-primary",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-canvas",
            "peer-disabled:opacity-50",
            "[&>svg]:scale-50 [&>svg]:opacity-0 [&>svg]:transition-[opacity,transform] [&>svg]:duration-150",
            "peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100 peer-indeterminate:[&>svg]:scale-100 peer-indeterminate:[&>svg]:opacity-100",
          )}
        >
          <Icon size={14} strokeWidth={3} />
        </span>
      </span>
      {(label || description) && (
        <span className={cn("min-w-0", disabled && "opacity-50")}>
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "block text-sm font-medium text-foreground",
                disabled ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              {label}
              {required && (
                <span className="ml-0.5 text-danger" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {description && (
            <span id={descriptionId} className="mt-0.5 block text-sm text-muted">
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
