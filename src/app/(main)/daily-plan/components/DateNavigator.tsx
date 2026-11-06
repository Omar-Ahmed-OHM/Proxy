import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { DEFAULT_LOCALE, addDays, parseISODate, toISODate } from "@/lib/date";
import type { DateNavigatorProps } from "../types";

function shift(date: string, amount: number): string {
  const parsed = parseISODate(date);
  return parsed ? toISODate(addDays(parsed, amount)) : date;
}

export function relativeDayLabel(date: string, today: string): string | null {
  if (date === today) return "Today";
  if (date === shift(today, 1)) return "Tomorrow";
  if (date === shift(today, -1)) return "Yesterday";
  return null;
}

export function formatPlanDate(date: string): string {
  const parsed = parseISODate(date);
  if (!parsed) return date;
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function DateNavigator({ date, today, onChange }: DateNavigatorProps) {
  const relative = relativeDayLabel(date, today);

  return (
    <nav
      aria-label="Plan date"
      className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-card/70 p-3 backdrop-blur sm:p-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-soft">
          <CalendarDays size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0" aria-live="polite">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">{relative ?? "Selected day"}</p>
          <p className="truncate text-base font-semibold text-foreground sm:text-lg">{formatPlanDate(date)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          aria-label="Previous day"
          onClick={() => onChange(shift(date, -1))}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </Button>
        <Button variant="outline" size="sm" disabled={date === today} onClick={() => onChange(today)}>
          Today
        </Button>
        <Button variant="secondary" size="sm" iconOnly aria-label="Next day" onClick={() => onChange(shift(date, 1))}>
          <ChevronRight size={18} aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
