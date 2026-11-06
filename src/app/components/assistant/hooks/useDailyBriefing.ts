"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/app/(main)/profile/hooks/useCurrentUser";
import { getReminders } from "@/app/(main)/reminders/api/reminders.api";
import { reminderKeys } from "@/app/(main)/reminders/hooks/useReminders";
import { getTasks } from "@/app/(main)/tasks/api/tasks.api";
import { taskKeys } from "@/app/(main)/tasks/hooks/useTasks";
import { dueDeadline, isSameDay, parseDueDate } from "@/lib/date";
import { getBriefing } from "../api/assistant.api";
import { briefingTitle, countTasks, describeTaskList, quote, spokenTime } from "../engine";
import type { DailyBriefingControls, DailyBriefingResult } from "../types";

export function useDailyBriefing(): DailyBriefingControls {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const firstName = user?.name.trim().split(/\s+/)[0] ?? null;

  const buildLocal = async (now: Date): Promise<string> => {
    const [tasks, reminders] = await Promise.all([
      queryClient.fetchQuery({ queryKey: taskKeys.all, queryFn: ({ signal }) => getTasks(signal), staleTime: 15_000 }),
      queryClient.fetchQuery({
        queryKey: reminderKeys.list({ status: "pending" }),
        queryFn: ({ signal }) => getReminders({ status: "pending" }, signal),
        staleTime: 15_000,
      }),
    ]);
    const open = tasks.filter((task) => task.status !== "completed");
    const today = open
      .map((task) => ({ task, due: parseDueDate(task.dueDate) }))
      .filter(({ due }) => due !== null && isSameDay(due.date, now))
      .sort((a, b) => (a.due?.date.getTime() ?? 0) - (b.due?.date.getTime() ?? 0));
    const overdue = open.filter((task) => {
      const due = parseDueDate(task.dueDate);
      return due !== null && !isSameDay(due.date, now) && dueDeadline(due) < now;
    });
    const nextReminder = reminders
      .filter((reminder) => reminder.status === "pending" && new Date(reminder.remindAt) > now)
      .filter((reminder) => isSameDay(new Date(reminder.remindAt), now))
      .sort((a, b) => a.remindAt.localeCompare(b.remindAt))[0];

    const parts: string[] = [];
    parts.push(
      today.length > 0
        ? `عندك ${countTasks(today.length)} النهارده: ${describeTaskList(
            today.map(({ task, due }) => ({ title: task.title, due: due?.date ?? null, allDay: due?.allDay ?? true })),
            false,
            now,
          )}`
        : "مفيش مهام ليها ميعاد النهارده",
    );
    if (overdue.length > 0) parts.push(`وعندك ${countTasks(overdue.length)} متأخرة`);
    if (nextReminder) parts.push(`وأقرب تذكير ${quote(nextReminder.title)} ${spokenTime(new Date(nextReminder.remindAt))}`);
    return `${parts.join("، ")}. يلا نبدأ يومنا!`;
  };

  const loadBriefing = async (): Promise<DailyBriefingResult> => {
    const now = new Date();
    const title = briefingTitle(now, firstName);
    try {
      const { message } = await getBriefing(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const greets = /^\s*(صباح|مساء|أهلا|اهلا)/.test(message);
      return { title: greets ? `ملخص يومك${firstName ? ` يا ${firstName}` : ""} 👋` : title, message, source: "ai" };
    } catch {
      return { title, message: await buildLocal(now), source: "local" };
    }
  };

  return { loadBriefing, firstName };
}
