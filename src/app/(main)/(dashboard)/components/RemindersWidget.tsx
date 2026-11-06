"use client";

import { BellRing } from "lucide-react";
import { useCompleteReminder, useReminders } from "@/app/(main)/reminders/hooks/useReminders";
import type { Reminder } from "@/app/(main)/reminders/types";
import { Card } from "@/app/components/ui/Card";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useNow } from "@/hooks/useNow";
import { isAllDayLocal, parseLocalDateTime } from "@/app/(main)/reminders/utils";
import type { UpcomingReminder } from "../types";
import { ReminderRow } from "./ReminderRow";
import { ViewAllLink } from "./ViewAllLink";
import { WidgetError } from "./WidgetError";

const MAX_ROWS = 3;

function toUpcoming(reminder: Reminder): UpcomingReminder | null {
  const local = parseLocalDateTime(reminder.remindAtLocal);
  if (!local) return null;
  return { reminder, at: local, allDay: isAllDayLocal(reminder.remindAtLocal) };
}

function getUpcoming(reminders: ReadonlyArray<Reminder>, now: Date): UpcomingReminder[] {
  return reminders
    .filter((reminder) => reminder.status === "pending" && new Date(reminder.remindAt) > now)
    .sort((a, b) => a.remindAt.localeCompare(b.remindAt))
    .map(toUpcoming)
    .filter((item): item is UpcomingReminder => item !== null)
    .slice(0, MAX_ROWS);
}

export function RemindersWidget() {
  const now = useNow();
  const { data: reminders, isPending, isError, error, refetch } = useReminders({ status: "pending" });
  const completeReminder = useCompleteReminder();
  const busyId = completeReminder.isPending ? completeReminder.variables : undefined;
  const upcoming = reminders && now ? getUpcoming(reminders, now) : [];

  return (
    <Card
      title="Upcoming Reminders"
      icon={<BellRing aria-hidden="true" />}
      headerAction={<ViewAllLink href="/reminders" label="View all reminders" />}
      className="h-full"
    >
      {isPending || !now ? (
        <ul aria-busy="true" aria-label="Loading reminders" className="flex flex-col">
          {Array.from({ length: MAX_ROWS }, (_, index) => (
            <li key={index} className="flex items-center gap-4 py-3">
              <Skeleton variant="custom" className="size-12 rounded-2xl" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton variant="text" className="w-2/3" />
                <Skeleton variant="text" className="h-3 w-1/3" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <WidgetError message={error.message} onRetry={() => void refetch()} />
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon={<BellRing aria-hidden="true" />}
          title="No upcoming reminders"
          description="Reminders you set will show up here."
        />
      ) : (
        <ul aria-label="Upcoming reminders" className="flex flex-col divide-y divide-border">
          {upcoming.map((item) => (
            <ReminderRow
              key={item.reminder.id}
              item={item}
              now={now}
              busy={busyId === item.reminder.id}
              onDone={(reminder) => completeReminder.mutate(reminder.id)}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
