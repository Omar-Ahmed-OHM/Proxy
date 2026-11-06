import type { Task } from "@/app/(main)/tasks/types";
import { parseDueDate } from "@/lib/date";
import type { HeadsUpItem, Reminder } from "./types";

export function parseLocalDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [, year, month, day, hours, minutes] = match.map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export function isAllDayLocal(value: string): boolean {
  return /T00:00(:00)?$/.test(value);
}

export const HEADS_UP_MS = 15 * 60_000;

const MEETING_PATTERN = /ميتينج|ميتنج|اجتماع|مكالم|meeting|call|zoom|meet/i;

export function isMeetingLike(...texts: ReadonlyArray<string | null | undefined>): boolean {
  return texts.some((text) => Boolean(text && MEETING_PATTERN.test(text)));
}

export function collectHeadsUps(
  tasks: ReadonlyArray<Task>,
  reminders: ReadonlyArray<Reminder>,
): HeadsUpItem[] {
  const items: HeadsUpItem[] = [];
  for (const task of tasks) {
    if (task.status === "completed" || !task.dueDate) continue;
    const due = parseDueDate(task.dueDate);
    if (!due || due.allDay) continue;
    items.push({ key: `pre:task:${task.id}@${task.dueDate}`, title: task.title, at: due.date.getTime(), source: "task" });
  }
  for (const reminder of reminders) {
    if (reminder.status !== "pending" || !isMeetingLike(reminder.title, reminder.description)) continue;
    const at = Date.parse(reminder.remindAt);
    if (Number.isNaN(at)) continue;
    items.push({ key: `pre:reminder:${reminder.id}@${reminder.remindAt}`, title: reminder.title, at, source: "reminder" });
  }
  return items;
}

const ALERTED_KEY = "proxy.reminders.alerted";
const SEEN_KEY = "proxy.reminders.seen";
const STORE_EVENT = "proxy-reminders-store";
const MAX_STORED = 200;
const memoryStore = new Map<string, string>();

export function reminderKey(reminder: { id: string; remindAt: string }): string {
  return `${reminder.id}@${reminder.remindAt}`;
}

function readRaw(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? memoryStore.get(key) ?? "[]";
  } catch {
    return memoryStore.get(key) ?? "[]";
  }
}

function parseKeys(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function addKeys(storageKey: string, keys: ReadonlyArray<string>) {
  const current = parseKeys(readRaw(storageKey));
  const next = [...current.filter((item) => !keys.includes(item)), ...keys].slice(-MAX_STORED);
  const raw = JSON.stringify(next);
  memoryStore.set(storageKey, raw);
  try {
    window.localStorage.setItem(storageKey, raw);
  } catch {}
  window.dispatchEvent(new Event(STORE_EVENT));
}

export function subscribeReminderStore(onChange: () => void) {
  window.addEventListener(STORE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(STORE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export const readAlertedRaw = () => readRaw(ALERTED_KEY);
export const readSeenRaw = () => readRaw(SEEN_KEY);
export const readAlertedKeys = () => parseKeys(readAlertedRaw());
export const parseReminderKeys = parseKeys;
export const markReminderAlerted = (key: string) => addKeys(ALERTED_KEY, [key]);
export const markRemindersSeen = (keys: ReadonlyArray<string>) => addKeys(SEEN_KEY, keys);
