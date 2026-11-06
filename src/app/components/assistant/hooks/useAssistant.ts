"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useRef, useState } from "react";
import { getTasks } from "@/app/(main)/tasks/api/tasks.api";
import { taskKeys, useCreateTask, useDeleteTask, useToggleTask, useUpdateTask } from "@/app/(main)/tasks/hooks/useTasks";
import type { Task } from "@/app/(main)/tasks/types";
import { dailyPlanKeys } from "@/app/(main)/daily-plan/hooks/useDailyPlans";
import { reminderKeys, useCreateReminder } from "@/app/(main)/reminders/hooks/useReminders";
import { dueDeadline, isSameDay, parseDueDate } from "@/lib/date";
import { ApiError } from "@/lib/http";
import {
  HELP_REPLY,
  UNKNOWN_REPLY,
  addLocalDays,
  combineDateTime,
  countTasks,
  describeTaskList,
  findTask,
  parseIntent,
  quote,
  spokenWhen,
  startOfLocalDay,
  toISODay,
  toOffsetDateTime,
} from "../engine";
import { sendAssistantMessage } from "../api/assistant.api";
import type {
  AssistantAction,
  AssistantHistoryItem,
  AssistantMode,
  ChatMessageData,
  PendingAction,
  SpokenTask,
  VoiceAssistant,
} from "../types";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";

function toSpoken(task: Task): SpokenTask {
  const due = parseDueDate(task.dueDate);
  return { title: task.title, due: due?.date ?? null, allDay: due?.allDay ?? true };
}

function byDue(a: Task, b: Task): number {
  const first = parseDueDate(a.dueDate);
  const second = parseDueDate(b.dueDate);
  if (!first || !second) return first ? -1 : second ? 1 : 0;
  if (first.allDay !== second.allDay && isSameDay(first.date, second.date)) return first.allDay ? 1 : -1;
  return first.date.getTime() - second.date.getTime();
}

function isOpen(task: Task): boolean {
  return task.status !== "completed";
}

function isDueOn(task: Task, day: Date): boolean {
  const due = parseDueDate(task.dueDate);
  return isOpen(task) && due !== null && isSameDay(due.date, day);
}

function scheduleValue(date: Date | null, time: string | null): string | undefined {
  if (date && time) return toOffsetDateTime(date, time);
  if (date) return toISODay(date);
  return undefined;
}

function resolveDate(date: Date | null, time: string | null, now: Date): Date | null {
  if (date || !time) return date;
  const today = startOfLocalDay(now);
  return combineDateTime(today, time) <= now ? addLocalDays(now, 1) : today;
}

function errorReply(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === "network" || error.kind === "timeout") {
      return "مش قادر أوصل للسيرفر دلوقتي، اتأكد إن الـ backend شغال وجرّب تاني.";
    }
    if (error.code === "REMINDER_IN_PAST") return "الميعاد ده فات خلاص، قولّي ميعاد جاي.";
    if (error.code === "TOO_MANY_REQUESTS") return "طلبات كتير ورا بعض، استنى شوية وجرّب تاني.";
    return `حصلت مشكلة: ${error.message}`;
  }
  return "حصلت مشكلة وأنا بنفّذ طلبك، جرّب تاني.";
}

const AI_RETRY_MS = 5 * 60_000;
const HISTORY_LIMIT = 20;

function shouldFallBack(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.code === "ASSISTANT_NOT_CONFIGURED" || error.code === "ASSISTANT_UNAVAILABLE") return true;
  if (error.kind === "network" || error.kind === "timeout" || error.kind === "invalid-response") return true;
  return error.status === 404 || (error.status ?? 0) >= 500;
}

function currentTime(): number {
  return new Date().getTime();
}

function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function createMessage(role: ChatMessageData["role"], content: string): ChatMessageData {
  return { id: crypto.randomUUID(), role, content, timestamp: new Date().toISOString(), status: "sent" };
}

export function useAssistant(): VoiceAssistant {
  const queryClient = useQueryClient();
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const createReminder = useCreateReminder();
  const speech = useSpeechSynthesis();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isResponding, setResponding] = useState(false);
  const [mode, setMode] = useState<AssistantMode>("ai");
  const aiOffUntilRef = useRef(0);
  const pendingRef = useRef<PendingAction | null>(null);
  const sendRef = useRef<(content: string) => void>(() => undefined);
  const recognition = useSpeechRecognition({
    lang: "ar-EG",
    onFinal: (transcript) => sendRef.current(transcript),
  });

  const loadTasks = () =>
    queryClient.fetchQuery({ queryKey: taskKeys.all, queryFn: ({ signal }) => getTasks(signal), staleTime: 15_000 });

  const listReply = (tasks: Task[], empty: string, lead: (count: string) => string, includeDay: boolean, now: Date) =>
    tasks.length === 0
      ? empty
      : `${lead(countTasks(tasks.length))}: ${describeTaskList(tasks.map(toSpoken), includeDay, now)}`;

  const findOrExplain = (query: string, tasks: Task[], ask: string): Task | string => {
    if (!query) return ask;
    const openMatch = findTask(query, tasks.filter(isOpen));
    const match = openMatch.best || openMatch.ambiguous ? openMatch : findTask(query, tasks);
    if (match.ambiguous) {
      return `لقيت أكتر من مهمة شبه كده: ${match.candidates.map((task) => quote(task.title)).join(" ولا ")}. قولّي الاسم بالظبط.`;
    }
    return match.best ?? `مش لاقي مهمة باسم ${quote(query)}.`;
  };

  const applyActions = (actions: ReadonlyArray<AssistantAction>) => {
    const touchesTasks = actions.some((action) => action.type.startsWith("task."));
    const touchesReminders = actions.some((action) => action.type.startsWith("reminder."));
    if (touchesTasks) {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      void queryClient.invalidateQueries({ queryKey: dailyPlanKeys.all });
    }
    if (touchesReminders) void queryClient.invalidateQueries({ queryKey: reminderKeys.all });
  };

  const askAi = async (text: string, history: AssistantHistoryItem[]): Promise<string> => {
    const { message, actions } = await sendAssistantMessage({ content: text, history, timezone: browserTimeZone() });
    applyActions(actions);
    return message.content;
  };

  const reply = async (text: string, history: AssistantHistoryItem[]): Promise<string> => {
    if (!pendingRef.current && currentTime() >= aiOffUntilRef.current) {
      try {
        const content = await askAi(text, history);
        setMode("ai");
        return content;
      } catch (error) {
        if (!shouldFallBack(error)) throw error;
        aiOffUntilRef.current = currentTime() + AI_RETRY_MS;
        setMode("local");
      }
    }
    return respondLocal(text);
  };

  const respondLocal = async (text: string): Promise<string> => {
    const now = new Date();
    const intent = parseIntent(text, now);
    const pending = pendingRef.current;

    if (pending) {
      pendingRef.current = null;
      if (intent.type === "CONFIRM") {
        await deleteTask.mutateAsync(pending.taskId);
        return `تمام، مسحت ${quote(pending.title)}.`;
      }
      if (intent.type === "CANCEL") return "تمام، مش هامسح حاجة.";
    }

    switch (intent.type) {
      case "GET_TODAY_TASKS": {
        const all = await loadTasks();
        const tasks = all.filter((task) => isDueOn(task, now)).sort(byDue);
        const undated = all.filter((task) => isOpen(task) && !task.dueDate);
        const undatedNote =
          undated.length > 0
            ? `عندك ${countTasks(undated.length)} من غير ميعاد: ${describeTaskList(undated.map(toSpoken), false, now)}`
            : "";
        if (tasks.length === 0) {
          return undatedNote ? `مفيش مهام ليها ميعاد النهارده، بس ${undatedNote}` : "مفيش مهام النهارده، يومك فاضي.";
        }
        const today = listReply(tasks, "", (count) => `عندك ${count} النهارده`, false, now);
        return undatedNote ? `${today} وكمان ${undatedNote}` : today;
      }
      case "GET_TOMORROW_TASKS": {
        const tomorrow = addLocalDays(now, 1);
        const tasks = (await loadTasks())
          .filter((task) => isDueOn(task, tomorrow))
          .sort(byDue);
        return listReply(tasks, "مفيش مهام بكره لحد دلوقتي.", (count) => `عندك ${count} بكره`, false, now);
      }
      case "GET_OVERDUE_TASKS": {
        const tasks = (await loadTasks())
          .filter((task) => {
            const due = parseDueDate(task.dueDate);
            return isOpen(task) && due !== null && dueDeadline(due) < now;
          })
          .sort(byDue);
        return listReply(tasks, "مفيش ولا مهمة متأخرة، عاش!", (count) => `عندك ${count} متأخرة`, true, now);
      }
      case "GET_PENDING_TASKS": {
        const tasks = (await loadTasks()).filter(isOpen).sort(byDue);
        return listReply(tasks, "مفيش مهام مفتوحة، كله خلصان.", (count) => `عندك ${count} لسه مخلصتهاش`, true, now);
      }
      case "CREATE_TASK": {
        if (!intent.title) return "عايز تسمّي المهمة إيه؟ قول مثلاً: ضيفلي مهمة مراجعة التقرير بكره.";
        const date = resolveDate(intent.dueDate, intent.time, now);
        const dueDate = scheduleValue(date, intent.time);
        const task = await createTask.mutateAsync({
          title: intent.title,
          priority: intent.priority ?? "medium",
          ...(dueDate && { dueDate }),
        });
        const when = date ? spokenWhen(intent.time ? combineDateTime(date, intent.time) : date, !intent.time, now) : "";
        const priority = intent.priority === "high" ? "، وعلّمتها إنها مهمة" : "";
        return `تمام، ضفتلك مهمة ${quote(task.title)}${when ? ` ${when}` : ""}${priority}.`;
      }
      case "CREATE_REMINDER": {
        if (!intent.title) return "عايزني أفكرك بإيه؟";
        if (!intent.time) return `تحب أفكرك بـ ${quote(intent.title)} الساعة كام؟ قول مثلاً: فكرني ${intent.title} الساعة 5.`;
        let date = intent.date ?? startOfLocalDay(now);
        if (!intent.dateExplicit && combineDateTime(date, intent.time) <= now) date = addLocalDays(now, 1);
        await createReminder.mutateAsync({
          title: intent.title,
          remindAt: `${toISODay(date)}T${intent.time}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        return `تمام، هفكرك بـ ${quote(intent.title)} ${spokenWhen(combineDateTime(date, intent.time), false, now)}.`;
      }
      case "COMPLETE_TASK": {
        const found = findOrExplain(intent.query, await loadTasks(), "أنهي مهمة اللي خلصتها؟");
        if (typeof found === "string") return found;
        if (!isOpen(found)) return `${quote(found.title)} متعلّم عليها إنها خلصت أصلاً.`;
        await toggleTask.mutateAsync({ id: found.id, completed: true });
        return `برافو! علّمت على ${quote(found.title)} إنها خلصت.`;
      }
      case "DELETE_TASK": {
        const found = findOrExplain(intent.query, await loadTasks(), "أنهي مهمة عايز تمسحها؟");
        if (typeof found === "string") return found;
        pendingRef.current = { type: "delete", taskId: found.id, title: found.title };
        return `متأكد إنك عايز تمسح ${quote(found.title)}؟ قول أيوه أو لأ.`;
      }
      case "RESCHEDULE_TASK": {
        const found = findOrExplain(intent.query, await loadTasks(), "أنهي مهمة عايز تغيّر ميعادها؟");
        if (typeof found === "string") return found;
        if (!intent.dueDate && !intent.time) {
          return `عايز تأجّل ${quote(found.title)} لإمتى؟ قول مثلاً: أجّل مهمة ${found.title} لبكره الساعة 5.`;
        }
        const date = intent.dueDate ?? parseDueDate(found.dueDate)?.date ?? resolveDate(null, intent.time, now);
        await updateTask.mutateAsync({ id: found.id, dueDate: scheduleValue(date, intent.time) ?? null });
        const when = date ? spokenWhen(intent.time ? combineDateTime(date, intent.time) : date, !intent.time, now) : "";
        return `تمام، غيّرت ميعاد ${quote(found.title)} لـ ${when}.`;
      }
      case "CONFIRM":
      case "CANCEL":
        return "مفيش حاجة مستنية تأكيد دلوقتي.";
      case "HELP":
        return HELP_REPLY;
      default:
        return UNKNOWN_REPLY;
    }
  };

  const sendMessage = (content: string) => {
    const text = content.trim();
    if (!text) return;
    const history: AssistantHistoryItem[] = messages
      .slice(-HISTORY_LIMIT)
      .map((message) => ({ role: message.role, content: message.content }));
    setMessages((current) => [...current, createMessage("user", text)]);
    setResponding(true);
    reply(text, history)
      .catch(errorReply)
      .then((reply) => {
        setMessages((current) => [...current, createMessage("assistant", reply)]);
        speech.speak(reply);
      })
      .finally(() => setResponding(false));
  };

  useLayoutEffect(() => {
    sendRef.current = sendMessage;
  });

  const startListening = () => {
    speech.cancel();
    recognition.clearError();
    recognition.start();
  };

  const stopAll = () => {
    recognition.stop();
    speech.cancel();
  };

  const voiceState = !recognition.supported
    ? "disabled"
    : recognition.listening
      ? "listening"
      : isResponding
        ? "processing"
        : "idle";

  const visualizerState = recognition.listening
    ? "listening"
    : speech.speaking
      ? "speaking"
      : isResponding
        ? "processing"
        : "idle";

  return {
    messages,
    mode,
    send: (content: string) => sendMessage(content),
    sendMessage,
    isResponding,
    reset: () => {
      pendingRef.current = null;
      setMessages([]);
    },
    voiceState,
    visualizerState,
    recognition,
    speech,
    startListening,
    stopListening: recognition.stop,
    stopAll,
  };
}
