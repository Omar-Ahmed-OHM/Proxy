import { Bell, Cake, Check, Clock, Pill, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { addDays, DEFAULT_LOCALE, isSameDay, startOfDay } from "@/lib/date";
import type { ReminderKind, ReminderRowProps } from "../types";
import type { Reminder } from "@/app/(main)/reminders/types";

const kindStyles: Record<ReminderKind, { icon: LucideIcon; tile: string }> = {
  meeting: { icon: Clock, tile: "from-primary to-primary-end shadow-glow" },
  health: { icon: Pill, tile: "from-success to-[#0ea57b] shadow-[0_0_20px_-4px_rgb(23_214_160/0.6)]" },
  birthday: { icon: Cake, tile: "from-warning to-[#ff7a1a] shadow-[0_0_20px_-4px_rgb(255_170_54/0.6)]" },
  general: { icon: Bell, tile: "from-secondary to-[#0b7fd6] shadow-glow-blue" },
};

const kindKeywords: ReadonlyArray<[ReminderKind, RegExp]> = [
  ["meeting", /meet|call|standup|sync|interview|appointment/i],
  ["health", /health|vitamin|medic|pill|doctor|gym|workout|water/i],
  ["birthday", /birthday|anniversary|party|celebrat/i],
];

function getKind(reminder: Reminder): ReminderKind {
  const text = `${reminder.title} ${reminder.description ?? ""}`;
  return kindKeywords.find(([, pattern]) => pattern.test(text))?.[0] ?? "general";
}

function formatWhen(at: Date, allDay: boolean, now: Date): string {
  const today = startOfDay(now);
  const day = isSameDay(at, today)
    ? "Today"
    : isSameDay(at, addDays(today, 1))
      ? "Tomorrow"
      : new Intl.DateTimeFormat(DEFAULT_LOCALE, { weekday: "short", month: "short", day: "numeric" }).format(at);
  const time = allDay
    ? "All Day"
    : new Intl.DateTimeFormat(DEFAULT_LOCALE, { hour: "numeric", minute: "2-digit" }).format(at);
  return `${day} • ${time}`;
}

export function ReminderRow({ item, now, busy = false, onDone }: ReminderRowProps) {
  const { reminder, at, allDay } = item;
  const styles = kindStyles[getKind(reminder)];
  const Icon = styles.icon;

  return (
    <li className={cn("flex items-center gap-4 py-3", busy && "opacity-60")}>
      <span
        aria-hidden="true"
        className={cn("grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-white", styles.tile)}
      >
        <Icon size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground sm:text-base">{reminder.title}</p>
        <p className="truncate text-sm text-muted">
          <time dateTime={reminder.remindAt}>{formatWhen(at, allDay, now)}</time>
        </p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => onDone(reminder)}
        aria-label={`Mark "${reminder.title}" as done`}
        className="group grid size-7 shrink-0 place-items-center rounded-full border-2 border-muted/60 text-transparent transition-colors hover:border-success hover:text-success disabled:cursor-wait"
      >
        <Check size={14} strokeWidth={3} aria-hidden="true" />
      </button>
    </li>
  );
}
