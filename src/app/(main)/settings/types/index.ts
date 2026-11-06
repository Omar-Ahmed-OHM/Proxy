import type { WeekStart } from "@/lib/date";

export type TimeFormat = "12h" | "24h";

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  reminders: boolean;
  taskDueDates: boolean;
}

export interface AssistantSettings {
  voiceEnabled: boolean;
  suggestionsEnabled: boolean;
}

export interface UserSettings {
  locale: string;
  timeZone: string;
  timeFormat: TimeFormat;
  weekStartsOn: WeekStart;
  notifications: NotificationSettings;
  assistant: AssistantSettings;
}

export interface UpdateSettingsInput {
  locale?: string;
  timeZone?: string;
  timeFormat?: TimeFormat;
  weekStartsOn?: WeekStart;
  notifications?: Partial<NotificationSettings>;
  assistant?: Partial<AssistantSettings>;
}
