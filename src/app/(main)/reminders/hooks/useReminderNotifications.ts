"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useTasks } from "@/app/(main)/tasks/hooks/useTasks";
import { useNow } from "@/hooks/useNow";
import type { ReminderNotification, ReminderNotifications } from "../types";
import {
  collectHeadsUps,
  markRemindersSeen,
  parseReminderKeys,
  readAlertedRaw,
  readSeenRaw,
  reminderKey,
  subscribeReminderStore,
} from "../utils";
import { useReminders } from "./useReminders";

const REFRESH_MS = 60_000;
const UPCOMING_MS = 24 * 60 * 60 * 1000;
const HISTORY_MS = 7 * 24 * 60 * 60 * 1000;
const HEADS_UP_TTL_MS = 60 * 60 * 1000;
const emptyRaw = () => "[]";

interface RankedNotification extends ReminderNotification {
  time: number;
}

const kindOrder: Record<ReminderNotification["kind"], number> = { "heads-up": 0, due: 1, upcoming: 2 };

export function useReminderNotifications(): ReminderNotifications {
  const now = useNow();
  const { data: reminders, isPending } = useReminders({ status: "pending" }, { refetchInterval: REFRESH_MS });
  const { data: tasks } = useTasks();
  const alertedRaw = useSyncExternalStore(subscribeReminderStore, readAlertedRaw, emptyRaw);
  const seenRaw = useSyncExternalStore(subscribeReminderStore, readSeenRaw, emptyRaw);

  const notifications = useMemo<ReminderNotification[]>(() => {
    if (!now) return [];
    const current = now.getTime();
    const alerted = new Set(parseReminderKeys(alertedRaw));
    const seen = new Set(parseReminderKeys(seenRaw));
    const items: RankedNotification[] = [];

    for (const reminder of reminders ?? []) {
      if (reminder.status !== "pending") continue;
      const key = reminderKey(reminder);
      const time = Date.parse(reminder.remindAt);
      const due = alerted.has(key) || time <= current;
      if (due ? time < current - HISTORY_MS : time > current + UPCOMING_MS) continue;
      items.push({
        key,
        title: reminder.title,
        description: reminder.description,
        at: reminder.remindAt,
        kind: due ? "due" : "upcoming",
        read: !due || seen.has(key),
        time,
      });
    }

    for (const item of collectHeadsUps(tasks ?? [], reminders ?? [])) {
      if (!alerted.has(item.key) || item.at < current - HEADS_UP_TTL_MS) continue;
      items.push({
        key: item.key,
        title: item.title,
        description: null,
        at: new Date(item.at).toISOString(),
        kind: "heads-up",
        read: seen.has(item.key),
        time: item.at,
      });
    }

    return items
      .sort((a, b) =>
        a.kind === b.kind ? (a.kind === "upcoming" ? a.time - b.time : b.time - a.time) : kindOrder[a.kind] - kindOrder[b.kind],
      )
      .map(({ key, title, description, at, kind, read }) => ({ key, title, description, at, kind, read }));
  }, [now, reminders, tasks, alertedRaw, seenRaw]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  return {
    notifications,
    unreadCount,
    isPending,
    markSeen: markRemindersSeen,
    markAllSeen: () => markRemindersSeen(notifications.filter((item) => !item.read).map((item) => item.key)),
  };
}
