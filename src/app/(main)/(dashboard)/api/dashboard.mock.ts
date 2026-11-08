import { ENDPOINTS, mockReply, type MockRoute } from "@/lib/http";
import { remindersDb } from "@/app/(main)/reminders/api/reminders.mock";
import { tasksDb } from "@/app/(main)/tasks/api/tasks.mock";
import type { DashboardSummary, Weather } from "../types";

const weather: Weather = { temperature: 24, unit: "C", condition: "clear", city: "Cairo", country: "Egypt" };

function summary(): DashboardSummary {
  return {
    totalTasks: { value: tasksDb.length, trend: 12, series: [3, 4, 3, 6, 5, 7, 6, 8] },
    upcomingReminders: { value: remindersDb.filter((reminder) => reminder.status === "pending").length, trend: 0, series: [2, 3, 2, 4, 3, 4, 3, 4] },
    tasksThisWeek: { value: tasksDb.filter((task) => task.status === "completed").length + 3, trend: 20, series: [1, 2, 1, 3, 2, 4, 3, 5] },
    dayStreak: { value: 7, trend: 0, series: [2, 3, 2, 4, 3, 5, 4, 6] },
  };
}

export const dashboardMock: MockRoute[] = [
  { method: "GET", path: ENDPOINTS.dashboard.summary, handler: () => mockReply({ summary: summary() }) },
  { method: "GET", path: ENDPOINTS.dashboard.weather, handler: () => mockReply({ weather }) },
];
