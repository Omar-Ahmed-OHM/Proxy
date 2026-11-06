"use client";

import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { controlHeights, controlStyles, fieldMessageId, FormField } from "@/app/components/ui/FormField";
import { PopoverPanel } from "@/app/components/ui/PopoverPanel";
import { usePopover } from "@/hooks/usePopover";
import { cn } from "@/lib/cn";
import { addDays, addMonths, clampDate, getCalendarDays, isSameDay, isSameMonth, startOfDay, startOfWeek, toISODate } from "@/lib/date";
import type { DatePickerProps } from "./types";

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates,
  placeholder = "Select date",
  disabled = false,
  clearable = false,
  size = "md",
  label,
  error,
  helperText,
  required = false,
  locale,
  weekStartsOn = 0,
  name,
  id,
  "aria-label": ariaLabel,
  className,
}: DatePickerProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const dialogId = `${triggerId}-calendar`;
  const headingId = `${triggerId}-heading`;
  const {
    open: isOpen,
    side: panelSide,
    align: panelAlign,
    containerRef,
    triggerRef,
    setOpen,
    close: closePopover,
  } = usePopover({ estimatedHeight: 380, estimatedWidth: 300 });
  const gridRef = useRef<HTMLTableElement>(null);
  const focusGridRef = useRef(false);
  const [focused, setFocused] = useState<Date>(() => startOfDay(value ?? new Date(2000, 0, 1)));
  const [today, setToday] = useState<Date | null>(null);
  const message = error ?? helperText;

  const isDisabled = (date: Date) => {
    if (minDate && date < startOfDay(minDate)) return true;
    if (maxDate && date > startOfDay(maxDate)) return true;
    if (typeof disabledDates === "function") return disabledDates(date);
    return disabledDates?.some((disabledDate) => isSameDay(disabledDate, date)) ?? false;
  };

  const days = useMemo(() => getCalendarDays(focused, weekStartsOn), [focused, weekStartsOn]);
  const weekdays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const narrow = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    const start = startOfWeek(new Date(2024, 0, 7), weekStartsOn);
    return Array.from({ length: 7 }, (_, index) => {
      const day = addDays(start, index);
      return { short: formatter.format(day), narrow: narrow.format(day) };
    });
  }, [locale, weekStartsOn]);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(focused);
  const dayLabel = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const displayValue = value
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(value)
    : null;

  useEffect(() => {
    if (!isOpen || !focusGridRef.current) return;
    focusGridRef.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [isOpen, focused]);

  const openCalendar = () => {
    setToday(startOfDay(new Date()));
    setFocused(clampDate(startOfDay(value ?? new Date()), minDate, maxDate));
    focusGridRef.current = true;
    setOpen(true);
  };

  const select = (date: Date) => {
    if (isDisabled(date)) return;
    onChange(date);
    closePopover(true);
  };

  const moveFocus = (next: Date) => setFocused(clampDate(next, minDate, maxDate));

  const handleGridKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const keyMap: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => startOfWeek(focused, weekStartsOn),
      End: () => addDays(startOfWeek(focused, weekStartsOn), 6),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    };
    const compute = keyMap[event.key];
    if (compute) {
      event.preventDefault();
      focusGridRef.current = true;
      moveFocus(compute());
    }
  };

  const canGoPrev =
    !minDate || new Date(focused.getFullYear(), focused.getMonth(), 0) >= startOfDay(minDate);
  const canGoNext =
    !maxDate || new Date(focused.getFullYear(), focused.getMonth() + 1, 1) <= startOfDay(maxDate);
  const showClear = clearable && value !== null && !disabled;

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
          aria-controls={dialogId}
          aria-describedby={message ? fieldMessageId(triggerId) : undefined}
          aria-label={ariaLabel ? `${ariaLabel}${displayValue ? `: ${displayValue}` : ""}` : undefined}
          onClick={() => (isOpen ? closePopover() : openCalendar())}
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
          <CalendarDays size={18} aria-hidden="true" className="shrink-0 text-muted" />
          <span className={cn("min-w-0 flex-1 truncate", !displayValue && "text-muted/60")}>
            {displayValue ?? placeholder}
          </span>
        </button>

        {showClear && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={() => {
              onChange(null);
              triggerRef.current?.focus();
            }}
            className="absolute inset-y-0 right-2 my-auto grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-foreground"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}

        {name && <input type="hidden" name={name} value={value ? toISODate(value) : ""} />}

        {isOpen && (
          <PopoverPanel
            id={dialogId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={headingId}
            side={panelSide}
            align={panelAlign}
            className="w-[19rem] p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => moveFocus(addMonths(focused, -1))}
                disabled={!canGoPrev}
                aria-label="Previous month"
                className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <h2 id={headingId} aria-live="polite" className="text-sm font-semibold text-foreground">
                {monthLabel}
              </h2>
              <button
                type="button"
                onClick={() => moveFocus(addMonths(focused, 1))}
                disabled={!canGoNext}
                aria-label="Next month"
                className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>

            <table
              ref={gridRef}
              role="grid"
              aria-labelledby={headingId}
              onKeyDown={handleGridKeyDown}
              className="w-full table-fixed border-collapse"
            >
              <thead>
                <tr>
                  {weekdays.map((weekday) => (
                    <th
                      key={weekday.short}
                      scope="col"
                      abbr={weekday.short}
                      className="pb-1 text-center text-[0.6875rem] font-medium text-muted uppercase"
                    >
                      {weekday.narrow}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, week) => (
                  <tr key={week}>
                    {days.slice(week * 7, week * 7 + 7).map((day) => {
                      const selected = value !== null && isSameDay(day, value);
                      const isToday = today !== null && isSameDay(day, today);
                      const outside = !isSameMonth(day, focused);
                      const unavailable = isDisabled(day);
                      const isFocused = isSameDay(day, focused);
                      return (
                        <td key={day.toISOString()} role="gridcell" aria-selected={selected} className="p-0.5">
                          <button
                            type="button"
                            tabIndex={isFocused ? 0 : -1}
                            disabled={unavailable}
                            aria-label={dayLabel.format(day)}
                            aria-current={isToday ? "date" : undefined}
                            onClick={() => select(day)}
                            className={cn(
                              "relative mx-auto grid size-9 place-items-center rounded-lg text-sm tabular-nums transition-colors",
                              "disabled:cursor-not-allowed disabled:opacity-25 disabled:line-through",
                              selected
                                ? "bg-primary font-semibold text-white shadow-glow"
                                : "text-foreground hover:bg-elevated-hover",
                              outside && !selected && "text-muted/50",
                              isToday && !selected && "font-semibold text-accent ring-1 ring-accent/50 ring-inset",
                            )}
                          >
                            {day.getDate()}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-2 flex justify-between border-t border-border pt-2">
              <button
                type="button"
                onClick={() => today && !isDisabled(today) && select(today)}
                disabled={today === null || isDisabled(today)}
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-primary-soft transition-colors hover:bg-elevated-hover disabled:opacity-30"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => closePopover(true)}
                className="rounded-lg px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-elevated-hover hover:text-foreground"
              >
                Close
              </button>
            </div>
          </PopoverPanel>
        )}
      </div>
    </FormField>
  );
}
