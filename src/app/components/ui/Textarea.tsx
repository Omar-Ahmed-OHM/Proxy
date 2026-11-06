"use client";

import {
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { cn } from "@/lib/cn";
import { controlStyles, fieldMessageId, FormField } from "./FormField";
import type { TextareaProps } from "./types";

export function Textarea({
  label,
  id,
  value,
  defaultValue,
  onChange,
  rows = 4,
  maxLength,
  disabled,
  required,
  error,
  helperText,
  showCharacterCount = false,
  autoResize = false,
  maxRows = 12,
  className,
  containerClassName,
  ref,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  const [uncontrolledLength, setUncontrolledLength] = useState(
    defaultValue !== undefined ? String(defaultValue).length : 0,
  );
  const length = value !== undefined ? String(value).length : uncontrolledLength;
  const message = error ?? helperText;

  const resize = () => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
    textarea.style.height = "auto";
    const maxHeight = lineHeight * maxRows + 24;
    textarea.style.height = `${Math.min(textarea.scrollHeight + 2, maxHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  useLayoutEffect(resize, [autoResize, maxRows, value]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) setUncontrolledLength(event.target.value.length);
    resize();
    onChange?.(event);
  };

  const counter = showCharacterCount ? (
    <span
      className={cn(
        "shrink-0 tabular-nums",
        maxLength !== undefined && length >= maxLength ? "text-warning" : "text-muted",
      )}
      aria-live="polite"
    >
      {maxLength !== undefined ? `${length}/${maxLength}` : length}
    </span>
  ) : undefined;

  return (
    <FormField
      id={textareaId}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      meta={counter}
      className={containerClassName}
    >
      <textarea
        ref={textareaRef}
        id={textareaId}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? fieldMessageId(textareaId) : undefined}
        className={controlStyles({
          invalid: Boolean(error),
          className: cn(
            "block px-3.5 py-3 leading-relaxed break-words overflow-x-hidden",
            autoResize ? "resize-none" : "resize-y",
            className,
          ),
        })}
        {...rest}
      />
    </FormField>
  );
}
