"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useCalendarEvents } from "@/app/(main)/calendar/hooks/useCalendarEvents";
import type { CalendarEvent } from "@/app/(main)/calendar/types";
import { Card } from "@/app/components/ui/Card";
import { cn } from "@/lib/cn";
import {
  addDays,
  addMonths,
  DEFAULT_LOCALE,
  getCalendarDays,
  isSameDay,
  isSameMonth,
  startOfDay,
  toISODate,
} from "@/lib/date";
import type { MonthCalendarProps } from "../types";
import { CalendarEventPill, toEventDate } from "./CalendarEventPill";

const WEEK_STARTS_ON = 0;

const keyOffsets: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

function groupByDay(events: ReadonlyArray<CalendarEvent>): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = toISODate(toEventDate(event.start));
    const list = map.get(key);
    if (list) list.push(event);
    else map.set(key, [event]);
  }
  for (const list of map.values()) {
    list.sort((a, b) => toEventDate(a.start).getTime() - toEventDate(b.start).getTime());
  }
  return map;
}

export function MonthCalendar({ now }: MonthCalendarProps) {
  const today = startOfDay(now);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);
  const gridRef = useRef<HTMLDivElement>(null);
  const focusAfterUpdate = useRef(false);

  const days = getCalendarDays(month, WEEK_STARTS_ON);
  const { data: events, isPending, isError } = useCalendarEvents({
    from: toISODate(days[0]),
    to: toISODate(days[days.length - 1]),
  });
  const eventsByDay = groupByDay(events ?? []);
  const selectedEvents = eventsByDay.get(toISODate(selected)) ?? [];
  const nextEvent =
    selectedEvents[0] ??
    (events ?? [])
      .filter((event) => toEventDate(event.start) > addDays(selected, 1))
      .sort((a, b) => toEventDate(a.start).getTime() - toEventDate(b.start).getTime())[0] ??
    null;

  const weekdayFormat = new Intl.DateTimeFormat(DEFAULT_LOCALE, { weekday: "short" });
  const fullDateFormat = new Intl.DateTimeFormat(DEFAULT_LOCALE, { dateStyle: "full" });
  const weekdays = days.slice(0, 7).map((day) => weekdayFormat.format(day).slice(0, 2));

  useEffect(() => {
    if (!focusAfterUpdate.current) return;
    focusAfterUpdate.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${toISODate(selected)}"]`)?.focus();
  }, [selected, month]);

  const select = (date: Date, moveFocus = false) => {
    focusAfterUpdate.current = moveFocus;
    setSelected(date);
    if (!isSameMonth(date, month)) setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const changeMonth = (amount: number) => {
    const next = addMonths(month, amount);
    setMonth(next);
    setSelected(isSameMonth(next, today) ? today : next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let target: Date | null = null;
    if (event.key in keyOffsets) target = addDays(selected, keyOffsets[event.key]);
    else if (event.key === "Home") target = addDays(selected, -selected.getDay());
    else if (event.key === "End") target = addDays(selected, 6 - selected.getDay());
    else if (event.key === "PageUp") target = addMonths(selected, -1);
    else if (event.key === "PageDown") target = addMonths(selected, 1);
    if (!target) return;
    event.preventDefault();
    select(target, true);
  };

  const monthLabel = new Intl.DateTimeFormat(DEFAULT_LOCALE, { month: "long", year: "numeric" }).format(month);

  return (
    <Card
      title="Calendar"
      icon={<CalendarDays aria-hidden="true" />}
      className="h-full"
      headerAction={
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated-hover hover:text-foreground"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated-hover hover:text-foreground"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      }
    >
      <p aria-live="polite" className="mb-2 text-center text-sm font-semibold text-foreground">
        {monthLabel}
      </p>

      <div
        ref={gridRef}
        role="group"
        aria-label={monthLabel}
        aria-busy={isPending || undefined}
        onKeyDown={handleKeyDown}
        className="grid grid-cols-7 gap-y-0.5 text-center"
      >
        {weekdays.map((weekday) => (
          <span key={weekday} aria-hidden="true" className="pb-1 text-xs font-medium text-muted">
            {weekday}
          </span>
        ))}
        {days.map((day) => {
          const key = toISODate(day);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selected);
          const inMonth = isSameMonth(day, month);
          const count = eventsByDay.get(key)?.length ?? 0;

          return (
            <button
              key={key}
              type="button"
              data-date={key}
              tabIndex={isSelected ? 0 : -1}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${fullDateFormat.format(day)}${count ? `, ${count} event${count > 1 ? "s" : ""}` : ""}`}
              onClick={() => select(day)}
              className="group relative mx-auto grid size-9 place-items-center rounded-full outline-none"
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full text-sm tabular-nums transition-colors",
                  "group-focus-visible:ring-2 group-focus-visible:ring-accent",
                  isToday
                    ? "bg-primary font-semibold text-white shadow-glow"
                    : isSelected
                      ? "bg-primary/20 font-medium text-foreground ring-1 ring-primary/60"
                      : inMonth
                        ? "text-foreground group-hover:bg-elevated-hover"
                        : "text-muted/45 group-hover:bg-elevated-hover",
                )}
              >
                {day.getDate()}
              </span>
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bottom-0 size-1 rounded-full",
                    inMonth ? "bg-secondary" : "bg-secondary/40",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        <CalendarEventPill
          event={isError ? null : nextEvent}
          emptyLabel={isError ? "Couldn't load events" : isPending ? "Loading events…" : "No upcoming events"}
        />
      </div>
    </Card>
  );
}
