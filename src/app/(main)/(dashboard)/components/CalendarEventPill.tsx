import { CalendarClock, Video } from "lucide-react";
import { DEFAULT_LOCALE, isSameDay, parseISODate } from "@/lib/date";
import type { CalendarEventPillProps } from "../types";

export function toEventDate(value: string): Date {
  return parseISODate(value) ?? new Date(value);
}

function formatEventTime(start: Date, end: Date, allDay: boolean): string {
  const dayFormat = new Intl.DateTimeFormat(DEFAULT_LOCALE, { month: "short", day: "numeric" });
  if (allDay) return isSameDay(start, end) ? "All day" : `${dayFormat.format(start)} – ${dayFormat.format(end)}`;
  const timeFormat = new Intl.DateTimeFormat(DEFAULT_LOCALE, { hour: "numeric", minute: "2-digit" });
  if (!isSameDay(start, end)) {
    const fullFormat = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    return fullFormat.formatRange(start, end);
  }
  return end > start ? timeFormat.formatRange(start, end) : timeFormat.format(start);
}

export function CalendarEventPill({ event, emptyLabel }: CalendarEventPillProps) {
  if (!event) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border-strong px-3 py-2.5 text-xs text-muted">
        <CalendarClock size={16} aria-hidden="true" />
        {emptyLabel}
      </div>
    );
  }

  const start = toEventDate(event.start);
  const end = toEventDate(event.end);
  const meetingUrl = event.location && /^https?:\/\//i.test(event.location) ? event.location : null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-linear-to-r from-primary/30 to-primary/10 px-3 py-2.5">
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-full bg-primary-soft shadow-[0_0_8px_var(--color-primary-soft)]"
        style={event.color ? { backgroundColor: event.color } : undefined}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
        <p className="truncate text-xs text-muted">
          <time dateTime={event.start}>{formatEventTime(start, end, event.allDay)}</time>
          {event.location && !meetingUrl && <> · {event.location}</>}
        </p>
      </div>
      {meetingUrl && (
        <a
          href={meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Join ${event.title}`}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-primary-soft transition-colors hover:bg-primary/20 hover:text-foreground"
        >
          <Video size={18} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
