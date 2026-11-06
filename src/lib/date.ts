export const DEFAULT_LOCALE = "en-US";

export type WeekStart = 0 | 1;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function addMonths(date: Date, amount: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

export function startOfWeek(date: Date, weekStartsOn: WeekStart): Date {
  const diff = (date.getDay() - weekStartsOn + 7) % 7;
  return addDays(date, -diff);
}

export function getCalendarDays(month: Date, weekStartsOn: WeekStart): Date[] {
  const first = startOfWeek(new Date(month.getFullYear(), month.getMonth(), 1), weekStartsOn);
  return Array.from({ length: 42 }, (_, index) => addDays(first, index));
}

export function clampDate(date: Date, min?: Date, max?: Date): Date {
  if (min && date < startOfDay(min)) return startOfDay(min);
  if (max && date > startOfDay(max)) return startOfDay(max);
  return date;
}

export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatTime(time: string, format: "12h" | "24h", locale?: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: format === "12h",
  }).format(date);
}

const relativeUnits: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

export function formatRelativeTime(value: Date | string, locale?: string, now = new Date()): string {
  const seconds = Math.round((toDate(value).getTime() - now.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  for (const [unit, unitSeconds] of relativeUnits) {
    if (Math.abs(seconds) >= unitSeconds) {
      return formatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return formatter.format(0, "minute");
}

export interface DueMoment {
  date: Date;
  allDay: boolean;
}

export function parseDueDate(value: string | null | undefined): DueMoment | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const day = parseISODate(value);
    return day ? { date: day, allDay: true } : null;
  }
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return null;
  if (/T00:00:00(\.000)?Z$/.test(value)) {
    return {
      date: new Date(instant.getUTCFullYear(), instant.getUTCMonth(), instant.getUTCDate()),
      allDay: true,
    };
  }
  return { date: instant, allDay: false };
}

export function dueDeadline(due: DueMoment): Date {
  if (!due.allDay) return due.date;
  const end = new Date(due.date);
  end.setHours(23, 59, 59, 999);
  return end;
}
