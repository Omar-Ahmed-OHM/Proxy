import type { ReactNode } from "react";
import type { VoiceAssistant } from "@/app/components/assistant/types";
import type { StatCardTone } from "@/app/components/shared/types";
import type { CalendarEvent } from "@/app/(main)/calendar/types";
import type { Reminder } from "@/app/(main)/reminders/types";
import type { Task } from "@/app/(main)/tasks/types";

export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "drizzle"
  | "thunderstorm"
  | "snow"
  | "fog"
  | "wind";

export type TemperatureUnit = "C" | "F";

export interface Weather {
  temperature: number;
  unit: TemperatureUnit;
  condition: WeatherCondition;
  city: string;
  country?: string;
}

export interface DashboardStat {
  value: number;
  trend: number;
  series: number[];
}

export interface DashboardSummary {
  totalTasks: DashboardStat;
  upcomingReminders: DashboardStat;
  tasksThisWeek: DashboardStat;
  dayStreak: DashboardStat;
}

export interface DashboardSummaryResponse {
  summary: DashboardSummary;
}

export interface WeatherResponse {
  weather: Weather;
}

export type DashboardStatKey = keyof DashboardSummary;

export interface DashboardStatConfig {
  key: DashboardStatKey;
  title: string;
  tone: StatCardTone;
  icon: ReactNode;
}

export type TaskFilter = "all" | "pending" | "completed";

export interface TaskRowProps {
  task: Task;
  now: Date | null;
  busy?: boolean;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export interface MonthCalendarProps {
  now: Date;
}

export interface CalendarEventPillProps {
  event: CalendarEvent | null;
  emptyLabel: string;
}

export type ReminderKind = "meeting" | "health" | "birthday" | "general";

export interface UpcomingReminder {
  reminder: Reminder;
  at: Date;
  allDay: boolean;
}

export interface ReminderRowProps {
  item: UpcomingReminder;
  now: Date;
  busy?: boolean;
  onDone: (reminder: Reminder) => void;
}

export interface WidgetErrorProps {
  message?: string;
  onRetry: () => void;
}

export interface ViewAllLinkProps {
  href: string;
  label: string;
}

export interface AssistantDialogProps {
  open: boolean;
  onClose: () => void;
  chat: VoiceAssistant;
  suggestions: ReadonlyArray<string>;
}
