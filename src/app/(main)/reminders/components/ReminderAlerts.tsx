"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useCurrentUser } from "@/app/(main)/profile/hooks/useCurrentUser";
import { useTasks } from "@/app/(main)/tasks/hooks/useTasks";
import { spokenTime } from "@/app/components/assistant/engine";
import { useSpeechSynthesis } from "@/app/components/assistant/hooks/useSpeechSynthesis";
import { ToastViewport } from "@/app/components/ui/Toast";
import type { ToastData } from "@/app/components/ui/types";
import { playChime, showSystemNotification, unlockAudioOnInteraction } from "@/lib/notifications";
import { useCompleteReminder, useReminders } from "../hooks/useReminders";
import type { HeadsUpItem, Reminder } from "../types";
import {
  HEADS_UP_MS,
  collectHeadsUps,
  markReminderAlerted,
  markRemindersSeen,
  readAlertedKeys,
  reminderKey,
} from "../utils";

const REFRESH_MS = 60_000;
const LOOKAHEAD_MS = 24 * 60 * 60 * 1000;
const GRACE_MS = 10 * 60 * 1000;
const MIN_HEADS_UP_MS = 60_000;

function minutesPhrase(minutes: number): string {
  if (minutes >= 14) return "يعني كمان ربع ساعة";
  if (minutes <= 1) return "يعني كمان دقيقة";
  if (minutes === 2) return "يعني كمان دقيقتين";
  if (minutes <= 10) return `يعني كمان ${minutes} دقايق`;
  return `يعني كمان ${minutes} دقيقة`;
}

export function ReminderAlerts() {
  const { data: reminders } = useReminders({ status: "pending" }, { refetchInterval: REFRESH_MS });
  const { data: tasks } = useTasks();
  const { data: user } = useCurrentUser();
  const firstName = user?.name.trim().split(/\s+/)[0] ?? null;
  const completeReminder = useCompleteReminder();
  const { speak } = useSpeechSynthesis();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = (id: string) => setToasts((current) => current.filter((toast) => toast.id !== id));

  const fire = useEffectEvent((reminder: Reminder, key: string) => {
    if (readAlertedKeys().includes(key)) return;
    markReminderAlerted(key);
    const toastId = `reminder-${reminder.id}`;
    const body = reminder.description || "ده ميعاد التذكير بتاعك.";
    setToasts((current) => [
      ...current.filter((toast) => toast.id !== toastId),
      {
        id: toastId,
        type: "info",
        title: `⏰ ${reminder.title}`,
        description: body,
        duration: 0,
        action: {
          label: "تم",
          onClick: () => {
            completeReminder.mutate(reminder.id);
            dismiss(toastId);
          },
        },
      },
    ]);
    playChime();
    speak(`فكّرتك: ${reminder.title}`);
    if (document.visibilityState !== "visible") void showSystemNotification(`⏰ ${reminder.title}`, body, toastId, "/reminders");
  });

  const fireHeadsUp = useEffectEvent((item: HeadsUpItem) => {
    if (readAlertedKeys().includes(item.key)) return;
    const remaining = item.at - Date.now();
    if (remaining <= 0) return;
    markReminderAlerted(item.key);
    const toastId = `heads-up-${item.key}`;
    const message = `${firstName ? `يا ${firstName}، ` : ""}عندك «${item.title}» ${spokenTime(new Date(item.at))}، ${minutesPhrase(
      Math.round(remaining / 60_000),
    )}.`;
    setToasts((current) => [
      ...current.filter((toast) => toast.id !== toastId),
      {
        id: toastId,
        type: "warning",
        title: `⏳ ${item.title}`,
        description: message,
        duration: 0,
        action: {
          label: "تمام",
          onClick: () => {
            markRemindersSeen([item.key]);
            dismiss(toastId);
          },
        },
      },
    ]);
    playChime();
    speak(message);
    if (document.visibilityState !== "visible") void showSystemNotification(`⏳ ${item.title}`, message, toastId, "/tasks");
  });

  useEffect(() => {
    const timers = timersRef.current;
    const now = Date.now();
    const alerted = new Set(readAlertedKeys());
    const active = new Set<string>();

    for (const reminder of reminders ?? []) {
      const key = reminderKey(reminder);
      if (reminder.status !== "pending" || alerted.has(key)) continue;
      const at = Date.parse(reminder.remindAt);
      if (Number.isNaN(at) || at < now - GRACE_MS || at > now + LOOKAHEAD_MS) continue;
      active.add(key);
      if (timers.has(key)) continue;
      timers.set(
        key,
        setTimeout(() => {
          timers.delete(key);
          fire(reminder, key);
        }, Math.max(0, at - now)),
      );
    }

    for (const item of collectHeadsUps(tasks ?? [], reminders ?? [])) {
      if (alerted.has(item.key)) continue;
      if (item.at - now < MIN_HEADS_UP_MS || item.at - now > LOOKAHEAD_MS) continue;
      active.add(item.key);
      if (timers.has(item.key)) continue;
      timers.set(
        item.key,
        setTimeout(() => {
          timers.delete(item.key);
          fireHeadsUp(item);
        }, Math.max(0, item.at - HEADS_UP_MS - now)),
      );
    }

    for (const [key, timer] of timers) {
      if (active.has(key)) continue;
      clearTimeout(timer);
      timers.delete(key);
    }
  }, [reminders, tasks]);

  useEffect(() => unlockAudioOnInteraction(), []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return <ToastViewport toasts={toasts} onClose={dismiss} position="top-center" label="تذكيرات" />;
}
