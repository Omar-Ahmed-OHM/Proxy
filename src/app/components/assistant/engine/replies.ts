import type { SpokenTask } from "../types";
import { addLocalDays, startOfLocalDay } from "./time";

const WEEKDAY_NAMES = ["الحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];

export function quote(title: string): string {
  return `«${title}»`;
}

export function countTasks(count: number): string {
  if (count === 1) return "مهمة واحدة";
  if (count === 2) return "مهمتين";
  if (count <= 10) return `${count} مهام`;
  return `${count} مهمة`;
}

export function spokenTime(date: Date): string {
  const minutes = date.getMinutes();
  const baseHour = (date.getHours() + (minutes === 45 ? 1 : 0)) % 24;
  const hour12 = baseHour % 12 === 0 ? 12 : baseHour % 12;
  const period =
    baseHour >= 5 && baseHour < 12 ? "الصبح" : baseHour >= 12 && baseHour < 15 ? "الضهر" : baseHour >= 15 && baseHour < 18 ? "العصر" : "بالليل";
  let fraction = "";
  if (minutes === 30) fraction = " ونص";
  else if (minutes === 15) fraction = " وربع";
  else if (minutes === 20) fraction = " وتلت";
  else if (minutes === 45) fraction = " إلا ربع";
  else if (minutes !== 0) fraction = ` و${minutes} دقيقة`;
  return `الساعة ${hour12}${fraction} ${period}`;
}

export function spokenDay(date: Date, now: Date): string {
  const target = startOfLocalDay(date).getTime();
  const today = startOfLocalDay(now).getTime();
  if (target === today) return "النهارده";
  if (target === addLocalDays(now, 1).getTime()) return "بكره";
  if (target === addLocalDays(now, 2).getTime()) return "بعد بكره";
  if (target === addLocalDays(now, -1).getTime()) return "امبارح";
  const diff = Math.round((target - today) / 86_400_000);
  if (diff > 0 && diff < 7) return `يوم ${WEEKDAY_NAMES[date.getDay()]}`;
  return `يوم ${date.getDate()}/${date.getMonth() + 1}`;
}

export function spokenWhen(due: Date | null, allDay: boolean, now: Date): string {
  if (!due) return "";
  const day = spokenDay(due, now);
  return allDay ? day : `${day} ${spokenTime(due)}`;
}

export function describeTaskList(tasks: ReadonlyArray<SpokenTask>, includeDay: boolean, now: Date): string {
  const items = tasks.slice(0, 5).map((task, index) => {
    const when = task.due
      ? includeDay
        ? ` ${spokenWhen(task.due, task.allDay, now)}`
        : task.allDay
          ? ""
          : ` ${spokenTime(task.due)}`
      : "";
    if (index === 0) return `أولها ${task.title}${when}`;
    if (index === 1) return `وبعدين ${task.title}${when}`;
    return `${task.title}${when}`;
  });
  const listed = items
    .map((item, index) => (index >= 2 && index === items.length - 1 ? `و${item}` : item))
    .join("، ");
  const more = tasks.length > 5 ? `، وفيه ${countTasks(tasks.length - 5)} كمان` : "";
  return `${listed}${more}.`;
}

export const HELP_REPLY =
  "أقدر أساعدك في مهامك. قول مثلاً: «عندي إيه النهارده؟»، أو «ضيفلي مهمة مراجعة التقرير بكره الساعة 6»، أو «خلصت مهمة التقرير»، أو «امسح مهمة الجيم»، أو «أجّل مهمة التقرير لبكره»، أو «فكرني أكلم أحمد الساعة 5»، أو «وريني المهام المتأخرة».";

export const UNKNOWN_REPLY =
  "مش فاهم قصدك أوي. ممكن تقول مثلاً: «عندي إيه النهارده؟» أو «ضيفلي مهمة الشغل على البروجكت بكره».";

export function toSpeakable(text: string): string {
  return text
    .replace(/[«»"“”]/g, "")
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function greetingFor(date: Date): string {
  return date.getHours() < 12 ? "صباح الخير" : "مساء الخير";
}

export function briefingTitle(date: Date, firstName: string | null): string {
  return firstName ? `${greetingFor(date)} يا ${firstName} 👋` : `${greetingFor(date)} 👋`;
}

export function briefingSpeech(title: string, message: string): string {
  return /^\s*(صباح|مساء)/.test(message) ? message : `${title}. ${message}`;
}
