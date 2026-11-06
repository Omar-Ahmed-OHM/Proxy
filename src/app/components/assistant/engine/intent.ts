import type { AssistantIntent, AssistantToken } from "../types";
import { normalizeArabic, tokenize } from "./normalize";
import { extractDate, extractPriority, extractRelative, extractTime } from "./time";

const CONFIRM_WORDS = new Set([
  "ايوه",
  "ايوا",
  "ايوة",
  "ايو",
  "اه",
  "ااه",
  "تمام",
  "اكيد",
  "نعم",
  "ماشي",
  "طبعا",
  "yes",
  "yeah",
  "yep",
  "ok",
  "okay",
  "sure",
  "confirm",
]);
const CANCEL_WORDS = new Set(["لا", "لاء", "لأ", "بلاش", "الغي", "الغاء", "خلاص", "سيبها", "no", "nope", "cancel", "stop"]);

const CREATE_VERBS = new Set([
  "ضيف",
  "ضيفلي",
  "ضيفي",
  "ضيفيلي",
  "اضف",
  "اضيف",
  "ضيفها",
  "اعمل",
  "اعملي",
  "اعمللي",
  "سجل",
  "سجلي",
  "سجللي",
  "حط",
  "حطلي",
  "زود",
  "add",
  "create",
  "new",
]);
const WANT_WORDS = new Set(["عايز", "عاوز", "عايزه", "عاوزه", "محتاج", "محتاجه", "نفسي"]);
const TASK_WORDS = new Set(["تاسك", "تسك", "التاسك", "مهمه", "المهمه", "مهام", "task", "a", "todo", "to-do"]);
const TITLE_LEAD_WORDS = new Set(["اني", "ان", "انا", "عشان", "علشان", "to", "that", "جديده", "جديد"]);
const FILLER_WORDS = new Set([
  "مهمه",
  "المهمه",
  "تاسك",
  "التاسك",
  "task",
  "the",
  "بتاعه",
  "بتاعت",
  "بتاع",
  "اللي",
  "هي",
  "دي",
  "ده",
  "خلاص",
  "بتاعتي",
  "my",
  "as",
  "done",
  "لو",
  "سمحت",
  "please",
  "من",
  "فضلك",
]);

const REMINDER_WORDS = new Set(["فكرني", "فكريني", "ذكرني", "ذكريني", "نبهني", "نبهيني", "remind"]);
const COMPLETE_WORDS = new Set(["خلصت", "خلصنا", "انهيت", "خلصتها", "خلصته", "خلّصت", "complete", "completed", "finish", "finished", "mark"]);
const DELETE_WORDS = new Set(["امسح", "امسحلي", "امسحي", "احذف", "احذفلي", "شيل", "شيلي", "شيلها", "delete", "remove"]);
const RESCHEDULE_WORDS = new Set(["اجل", "اجلي", "اجلها", "اخر", "اخرها", "اخرلي", "reschedule", "postpone", "move"]);
const CHANGE_WORDS = new Set(["غير", "غيرلي", "عدل", "عدللي", "عدلي", "change", "update"]);
const TIME_WORDS = new Set(["ميعاد", "معاد", "موعد", "وقت", "تاريخ", "time", "date"]);

const QUESTION_WORDS = new Set(["ايه", "ايش", "اي", "شو", "وريني", "ورينى", "قولي", "قوللي", "اعرض", "عرض", "show", "what", "list"]);
const OVERDUE_WORDS = new Set(["متاخره", "المتاخره", "متاخر", "المتاخر", "overdue", "late"]);
const PENDING_WORDS = new Set(["كل", "كلها", "باقي", "لسه", "pending", "all", "remaining"]);
const HAVE_WORDS = new Set(["عندي", "ورايا", "عليا", "مهامي", "مهماتي", "have", "tasks", "مهام", "المهام", "التاسكات", "تاسكات"]);
const HELP_WORDS = new Set(["مساعده", "ساعدني", "help", "تقدر", "بتعمل", "بتعرف"]);

function has(tokens: AssistantToken[], set: ReadonlySet<string>): boolean {
  return tokens.some((token) => set.has(token.norm));
}

function indexOfSet(tokens: AssistantToken[], set: ReadonlySet<string>): number {
  return tokens.findIndex((token) => set.has(token.norm));
}

function cleanText(tokens: AssistantToken[], used: ReadonlySet<number>, drop: ReadonlySet<string>): string {
  const remaining = tokens.filter((token, index) => !used.has(index) && !drop.has(token.norm));
  while (remaining.length > 0 && (TITLE_LEAD_WORDS.has(remaining[0].norm) || FILLER_WORDS.has(remaining[0].norm))) {
    remaining.shift();
  }
  while (remaining.length > 0 && /^(و|يوم|الساعه|في|on|at|by)$/.test(remaining[remaining.length - 1].norm)) {
    remaining.pop();
  }
  return remaining.map((token) => token.raw).join(" ").trim();
}

function extractSchedule(tokens: AssistantToken[], now: Date) {
  const relative = extractRelative(tokens, now);
  if (relative) {
    const used = new Set(relative.indices);
    const priority = extractPriority(tokens);
    priority?.indices.forEach((index) => used.add(index));
    return {
      time: { time: relative.time, indices: relative.indices },
      date: { date: relative.date, explicit: true, indices: relative.indices },
      priority,
      used,
    };
  }
  const time = extractTime(tokens);
  const used = new Set(time?.indices ?? []);
  const date = extractDate(tokens, now, used);
  date?.indices.forEach((index) => used.add(index));
  const priority = extractPriority(tokens);
  priority?.indices.forEach((index) => used.add(index));
  return { time, date, priority, used };
}

function createIntent(tokens: AssistantToken[], now: Date, verbIndex: number): AssistantIntent {
  const { time, date, priority, used } = extractSchedule(tokens, now);
  for (let index = 0; index <= verbIndex; index += 1) used.add(index);
  const next = tokens[verbIndex + 1];
  if (next && TASK_WORDS.has(next.norm)) used.add(verbIndex + 1);
  if (tokens[0] && WANT_WORDS.has(tokens[0].norm)) used.add(0);
  return {
    type: "CREATE_TASK",
    title: cleanText(tokens, used, new Set(["لي", "ليا", "me"])),
    dueDate: date?.date ?? null,
    time: time?.time ?? null,
    priority: priority?.priority ?? null,
  };
}

function queryIntent(tokens: AssistantToken[], triggerIndex: number, extra: ReadonlySet<string> = new Set()): string {
  const used = new Set<number>([triggerIndex]);
  const drop = new Set([...FILLER_WORDS, ...extra]);
  return cleanText(tokens, used, drop);
}

export function parseIntent(text: string, now: Date): AssistantIntent {
  const tokens = tokenize(text);
  if (tokens.length === 0) return { type: "UNKNOWN" };
  const joined = normalizeArabic(text);

  if (tokens.length <= 3) {
    if (tokens.every((token) => CANCEL_WORDS.has(token.norm) || token.norm === "شكرا") && has(tokens, CANCEL_WORDS)) {
      return { type: "CANCEL" };
    }
    const confirmTail = new Set([...CONFIRM_WORDS, "امسحها", "امسح", "كده", "يلا", "please"]);
    if (CONFIRM_WORDS.has(tokens[0].norm) && tokens.slice(1).every((token) => confirmTail.has(token.norm))) {
      return { type: "CONFIRM" };
    }
  }

  const reminderIndex = indexOfSet(tokens, REMINDER_WORDS);
  if (reminderIndex !== -1 && reminderIndex <= 2) {
    const { time, date, used } = extractSchedule(tokens, now);
    for (let index = 0; index <= reminderIndex; index += 1) used.add(index);
    if (tokens[reminderIndex + 1]?.norm === "me") used.add(reminderIndex + 1);
    return {
      type: "CREATE_REMINDER",
      title: cleanText(tokens, used, new Set(["بـ", "ب", "to", "about"])).replace(/^ب(?=ال)/, ""),
      date: date?.date ?? null,
      dateExplicit: Boolean(date),
      time: time?.time ?? null,
    };
  }

  const leadingVerb = tokens.slice(0, 3).findIndex((token) => CREATE_VERBS.has(token.norm));
  if (leadingVerb !== -1) return createIntent(tokens, now, leadingVerb);

  const wantIndex = WANT_WORDS.has(tokens[0].norm) ? 0 : -1;
  if (wantIndex === 0 && tokens[1] && (CREATE_VERBS.has(tokens[1].norm) || TASK_WORDS.has(tokens[1].norm))) {
    return createIntent(tokens, now, 1);
  }

  const rescheduleIndex = indexOfSet(tokens, RESCHEDULE_WORDS);
  const changeIndex = indexOfSet(tokens, CHANGE_WORDS);
  if (rescheduleIndex !== -1 || (changeIndex !== -1 && has(tokens, TIME_WORDS))) {
    const { time, date, used } = extractSchedule(tokens, now);
    const trigger = rescheduleIndex !== -1 ? rescheduleIndex : changeIndex;
    used.add(trigger);
    const drop = new Set([...FILLER_WORDS, ...TIME_WORDS, "لـ", "ل", "لحد", "لبعد", "على", "علي", "الي", "to", "for", "until", "of"]);
    return {
      type: "RESCHEDULE_TASK",
      query: cleanText(tokens, used, drop),
      dueDate: date?.date ?? null,
      time: time?.time ?? null,
    };
  }

  const completeIndex = indexOfSet(tokens, COMPLETE_WORDS);
  if (completeIndex !== -1 && completeIndex <= 2) {
    return { type: "COMPLETE_TASK", query: queryIntent(tokens, completeIndex, new Set(["علي", "على", "انها", "خلصت", "complete", "completed"])) };
  }

  const deleteIndex = indexOfSet(tokens, DELETE_WORDS);
  if (deleteIndex !== -1 && deleteIndex <= 2) {
    return { type: "DELETE_TASK", query: queryIntent(tokens, deleteIndex) };
  }

  if (changeIndex !== -1 && joined.includes("خلصت")) {
    return { type: "COMPLETE_TASK", query: queryIntent(tokens, changeIndex) };
  }

  if (has(tokens, OVERDUE_WORDS) || joined.includes("فات معاد") || joined.includes("فات ميعاد")) {
    return { type: "GET_OVERDUE_TASKS" };
  }

  const asksAboutTasks = has(tokens, QUESTION_WORDS) || has(tokens, HAVE_WORDS) || text.includes("?") || text.includes("؟");
  const date = extractDate(tokens, now);
  if (asksAboutTasks && date) {
    const dayDiff = Math.round((date.date.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86_400_000);
    if (dayDiff === 1) return { type: "GET_TOMORROW_TASKS" };
    if (dayDiff === 0) return { type: "GET_TODAY_TASKS" };
  }

  if (has(tokens, HELP_WORDS) || joined.includes("تعمل ايه") || joined.includes("what can you")) {
    return { type: "HELP" };
  }

  if ((has(tokens, PENDING_WORDS) || has(tokens, QUESTION_WORDS)) && has(tokens, HAVE_WORDS)) {
    return { type: "GET_PENDING_TASKS" };
  }
  if (has(tokens, HAVE_WORDS) && (has(tokens, QUESTION_WORDS) || text.includes("?") || text.includes("؟"))) {
    return { type: "GET_TODAY_TASKS" };
  }

  const anyVerb = tokens.findIndex((token) => CREATE_VERBS.has(token.norm));
  if (anyVerb !== -1) return createIntent(tokens, now, anyVerb);

  return { type: "UNKNOWN" };
}
