"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, type FormEvent } from "react";
import { Input } from "@/app/components/ui/Input";
import { Spinner } from "@/app/components/ui/Spinner";
import { cn } from "@/lib/cn";
import type { SearchBarProps } from "./types";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  onClear,
  onSubmit,
  disabled = false,
  loading = false,
  showShortcut = false,
  shortcutKey = "K",
  size = "md",
  "aria-label": ariaLabel = "Search",
  className,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showShortcut || disabled) return;
    const key = shortcutKey.toLowerCase();
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === key) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [disabled, shortcutKey, showShortcut]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit?.(trimmed);
  };

  const rightIcon = loading ? (
    <Spinner size={16} label="Searching" />
  ) : showShortcut && !value ? (
    <kbd className="hidden h-6 items-center gap-0.5 rounded-md border border-border-strong bg-elevated px-1.5 font-sans text-[0.6875rem] font-medium text-muted sm:inline-flex">
      <span aria-hidden="true">Ctrl</span>
      <span className="sr-only">Control plus</span>
      {shortcutKey.toUpperCase()}
    </kbd>
  ) : undefined;

  return (
    <form role="search" onSubmit={handleSubmit} className={cn("w-full min-w-0", className)}>
      <Input
        ref={inputRef}
        type="search"
        size={size}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClear={() => {
          onChange("");
          onClear?.();
        }}
        clearable
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        leftIcon={<Search aria-hidden="true" />}
        rightIcon={rightIcon}
        enterKeyHint="search"
        autoComplete="off"
      />
    </form>
  );
}
