"use client";

import { Eye, EyeOff, X } from "lucide-react";
import { useId, useImperativeHandle, useRef, useState, type ChangeEvent } from "react";
import { cn } from "@/lib/cn";
import { controlHeights, controlStyles, fieldMessageId, FormField } from "./FormField";
import type { InputProps } from "./types";

function setNativeValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export function Input({
  label,
  type = "text",
  size = "md",
  id,
  value,
  defaultValue,
  onChange,
  disabled,
  required,
  error,
  helperText,
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  disablePasswordToggle = false,
  className,
  containerClassName,
  ref,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(
    defaultValue !== undefined && String(defaultValue).length > 0,
  );
  const hasValue = value !== undefined ? String(value).length > 0 : uncontrolledHasValue;

  const isPassword = type === "password";
  const showPasswordToggle = isPassword && !disablePasswordToggle;
  const showClear = type === "search" && clearable && hasValue && !disabled;
  const hasRightAdornment = showPasswordToggle || showClear || Boolean(rightIcon);
  const message = error ?? helperText;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setUncontrolledHasValue(event.target.value.length > 0);
    onChange?.(event);
  };

  const handleClear = () => {
    const input = inputRef.current;
    if (!input) return;
    setNativeValue(input, "");
    onClear?.();
    input.focus();
  };

  return (
    <FormField
      id={inputId}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      className={containerClassName}
    >
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted [&_svg]:size-4.5">
            {leftIcon}
          </span>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type={isPassword && passwordVisible ? "text" : type}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? fieldMessageId(inputId) : undefined}
          className={controlStyles({
            invalid: Boolean(error),
            className: cn(
              controlHeights[size],
              "px-3.5 [&::-webkit-search-cancel-button]:appearance-none",
              leftIcon ? "pl-10" : undefined,
              hasRightAdornment ? "pr-11" : undefined,
              showClear && rightIcon ? "pr-18" : undefined,
              className,
            ),
          })}
          {...rest}
        />
        {hasRightAdornment && (
          <span className="absolute inset-y-0 right-1.5 flex items-center gap-0.5 text-muted">
            {showClear && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear"
                className="grid size-8 place-items-center rounded-lg transition-colors hover:bg-elevated hover:text-foreground"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
            {showPasswordToggle ? (
              <button
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                disabled={disabled}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                aria-pressed={passwordVisible}
                className="grid size-8 place-items-center rounded-lg transition-colors hover:bg-elevated hover:text-foreground disabled:pointer-events-none"
              >
                {passwordVisible ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
            ) : (
              rightIcon && (
                <span className="pointer-events-none flex items-center px-2 [&_svg]:size-4.5">
                  {rightIcon}
                </span>
              )
            )}
          </span>
        )}
      </div>
    </FormField>
  );
}
