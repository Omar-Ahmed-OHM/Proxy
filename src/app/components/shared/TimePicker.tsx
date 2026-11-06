"use client";

import { Clock, X } from "lucide-react";
import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { controlHeights, controlStyles, fieldMessageId, FormField } from "@/app/components/ui/FormField";
import { PopoverPanel } from "@/app/components/ui/PopoverPanel";
import { usePopover } from "@/hooks/usePopover";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/date";
import type { Period, TimePickerProps, TimeParts, TimeColumnOption, TimeColumnProps } from "./types";

function parseTime(value: string | null): TimeParts | null {
  const match = value ? /^(\d{1,2}):(\d{2})$/.exec(value) : null;
  if (!match) return null;
  return { hours: Number(match[1]) % 24, minutes: Number(match[2]) % 60 };
}

function toTimeString({ hours, minutes }: TimeParts): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function TimeColumn({ label, options, selected, onSelect }: TimeColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedIndex = options.findIndex((option) => option.value === selected);
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0;

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      ?.scrollIntoView({ block: "center" });
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const targets: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: buttons.length - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    buttons[(target + buttons.length) % buttons.length]?.focus();
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <p className="px-1 pb-1.5 text-center text-[0.6875rem] font-medium text-muted uppercase">{label}</p>
      <div
        ref={listRef}
        role="group"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="flex max-h-52 flex-col gap-0.5 overflow-y-auto overscroll-contain px-0.5 [scrollbar-width:thin]"
      >
        {options.map((option, index) => {
          const isSelected = option.value === selected;
          return (
            <button
              key={option.value}
              type="button"
              tabIndex={index === tabbableIndex ? 0 : -1}
              aria-pressed={isSelected}
              onClick={() => onSelect(option.value)}
              className={cn(
                "h-9 shrink-0 rounded-lg text-sm tabular-nums transition-colors",
                isSelected
                  ? "bg-primary font-semibold text-white"
                  : "text-foreground hover:bg-elevated-hover",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimePicker({
  value,
  onChange,
  format = "12h",
  minuteStep = 5,
  disabled = false,
  placeholder = "Select time",
  clearable = false,
  size = "md",
  label,
  error,
  helperText,
  required = false,
  locale,
  name,
  id,
  "aria-label": ariaLabel,
  className,
}: TimePickerProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const panelId = `${triggerId}-panel`;
  const {
    open: isOpen,
    side: panelSide,
    align: panelAlign,
    containerRef,
    triggerRef,
    close: closePopover,
    toggle: togglePopover,
  } = usePopover({ estimatedHeight: 300, estimatedWidth: 260 });
  const panelRef = useRef<HTMLDivElement>(null);
  const parts = parseTime(value);
  const message = error ?? helperText;
  const step = Math.min(30, Math.max(1, Math.round(minuteStep)));

  useEffect(() => {
    if (isOpen) panelRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [isOpen]);

  const period: Period | null = parts ? (parts.hours >= 12 ? "PM" : "AM") : null;
  const displayHour = parts ? (format === "12h" ? parts.hours % 12 || 12 : parts.hours) : null;

  const hourOptions: TimeColumnOption[] =
    format === "12h"
      ? Array.from({ length: 12 }, (_, index) => ({ label: String(index + 1), value: index + 1 }))
      : Array.from({ length: 24 }, (_, index) => ({ label: String(index).padStart(2, "0"), value: index }));

  const minuteOptions: TimeColumnOption[] = Array.from({ length: Math.ceil(60 / step) }, (_, index) => ({
    label: String(index * step).padStart(2, "0"),
    value: index * step,
  }));

  const update = (next: Partial<TimeParts>) => {
    const base = parts ?? { hours: 9, minutes: 0 };
    onChange(toTimeString({ ...base, ...next }));
  };

  const selectHour = (hour: number) => {
    if (format === "24h") return update({ hours: hour });
    const isPM = (period ?? "AM") === "PM";
    update({ hours: (hour % 12) + (isPM ? 12 : 0) });
  };

  const selectPeriod = (next: Period) => {
    const hours = parts?.hours ?? 9;
    const base = hours % 12;
    update({ hours: next === "PM" ? base + 12 : base });
  };

  const displayValue = value && parts ? formatTime(toTimeString(parts), format, locale) : null;
  const showClear = clearable && value !== null && !disabled;
  const selectedMinute = parts ? minuteOptions.find((option) => option.value === parts.minutes)?.value ?? null : null;

  return (
    <FormField
      id={triggerId}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      className={className}
    >
      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-describedby={message ? fieldMessageId(triggerId) : undefined}
          aria-label={ariaLabel ? `${ariaLabel}${displayValue ? `: ${displayValue}` : ""}` : undefined}
          onClick={togglePopover}
          className={controlStyles({
            invalid: Boolean(error),
            className: cn(
              "flex items-center gap-2.5 px-3.5 text-left",
              controlHeights[size],
              showClear && "pr-11",
              isOpen && "border-primary/70 ring-4 ring-primary/20",
            ),
          })}
        >
          <Clock size={18} aria-hidden="true" className="shrink-0 text-muted" />
          <span className={cn("min-w-0 flex-1 truncate tabular-nums", !displayValue && "text-muted/60")}>
            {displayValue ?? placeholder}
          </span>
        </button>

        {showClear && (
          <button
            type="button"
            aria-label="Clear time"
            onClick={() => {
              onChange(null);
              triggerRef.current?.focus();
            }}
            className="absolute inset-y-0 right-2 my-auto grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-foreground"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}

        {name && <input type="hidden" name={name} value={value ?? ""} />}

        {isOpen && (
          <PopoverPanel
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={label ?? ariaLabel ?? "Choose time"}
            side={panelSide}
            align={panelAlign}
            className="w-64 p-3"
          >
            <div className="flex gap-2">
              <TimeColumn label="Hour" options={hourOptions} selected={displayHour} onSelect={selectHour} />
              <TimeColumn
                label="Minute"
                options={minuteOptions}
                selected={selectedMinute}
                onSelect={(minutes) => update({ minutes })}
              />
              {format === "12h" && (
                <div className="flex w-14 shrink-0 flex-col">
                  <p className="pb-1.5 text-center text-[0.6875rem] font-medium text-muted uppercase">Period</p>
                  <div role="group" aria-label="AM or PM" className="flex flex-col gap-0.5">
                    {(["AM", "PM"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={period === option}
                        onClick={() => selectPeriod(option)}
                        className={cn(
                          "h-9 rounded-lg text-sm font-medium transition-colors",
                          period === option
                            ? "bg-primary text-white"
                            : "text-foreground hover:bg-elevated-hover",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-end border-t border-border pt-2">
              <button
                type="button"
                onClick={() => closePopover(true)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary-soft transition-colors hover:bg-elevated-hover"
              >
                Done
              </button>
            </div>
          </PopoverPanel>
        )}
      </div>
    </FormField>
  );
}
