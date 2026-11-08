import { createMockAdapter, createMockMatcher } from "@/lib/http/mockAdapter";
import { authMock } from "@/app/(auth)/api/auth.mock";
import { dashboardMock } from "@/app/(main)/(dashboard)/api/dashboard.mock";
import { dailyPlanMock } from "@/app/(main)/daily-plan/api/daily-plan.mock";
import { calendarMock } from "@/app/(main)/calendar/api/calendar.mock";
import { assistantMock } from "@/app/components/assistant/api/assistant.mock";
import { notesMock } from "@/app/(main)/notes/api/notes.mock";
import { notificationsMock } from "@/app/notifications/api/notifications.mock";
import { profileMock } from "@/app/(main)/profile/api/profile.mock";
import { remindersMock } from "@/app/(main)/reminders/api/reminders.mock";
import { settingsMock } from "@/app/(main)/settings/api/settings.mock";
import { tasksMock } from "@/app/(main)/tasks/api/tasks.mock";

const backendMocks = [
  ...authMock,
  ...profileMock,
  ...tasksMock,
  ...remindersMock,
  ...dailyPlanMock,
  ...assistantMock,
  ...dashboardMock,
];

const pendingMocks = [
  ...calendarMock,
  ...notesMock,
  ...settingsMock,
  ...notificationsMock,
];

export const mockAdapter = createMockAdapter([...backendMocks, ...pendingMocks]);

export const isPendingEndpoint = createMockMatcher(pendingMocks);
