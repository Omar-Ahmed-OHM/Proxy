import type {
  AssistantToken,
  DayPeriod,
  ExtractedDate,
  ExtractedPriority,
  ExtractedRelative,
  ExtractedTime,
} from "../types";

const pad = (value: number) => String(value).padStart(2, "0");

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addLocalDays(date: Date, amount: number): Date {
  const next = startOfLocalDay(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function toISODay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
}

export function toOffsetDateTime(date: Date, time: string): string {
  const local = combineDateTime(date, time);
  const offset = -local.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const absolute = Math.abs(offset);
  return `${toISODay(local)}T${time}:00${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`;
}

const NUMBER_WORDS: Record<string, number> = {
  واحده: 1,
  واحد: 1,
  اتنين: 2,
  اثنين: 2,
  تنين: 2,
  تلاته: 3,
  ثلاثه: 3,
  تلات: 3,
  اربعه: 4,
  اربع: 4,
  خمسه: 5,
  خمس: 5,
  سته: 6,
  ست: 6,
  سبعه: 7,
  سبع: 7,
  تمانيه: 8,
  ثمانيه: 8,
  تمنيه: 8,
  تمانه: 8,
  تسعه: 9,
  تسع: 9,
  عشره: 10,
  عشر: 10,
  حداشر: 11,
  احداشر: 11,
  حداشره: 11,
  اتناشر: 12,
  اثناشر: 12,
  اتناشره: 12,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const AM_WORDS = new Set(["الصبح", "صباحا", "صباح", "الصباح", "الفجر", "فجرا", "ص", "am", "morning"]);
const NOON_WORDS = new Set(["الضهر", "الظهر", "ضهرا", "ظهرا", "noon"]);
const NIGHT_WORDS = new Set(["بالليل", "باليل", "بليل", "الليل", "ليلا", "night", "tonight"]);
const PM_WORDS = new Set([
  "العصر",
  "عصرا",
  "المغرب",
  "مساء",
  "مساءا",
  "المسا",
  "بالمسا",
  "المساء",
  "م",
  "pm",
  "evening",
]);
const HOUR_PREFIXES = new Set(["الساعه", "ساعه", "الساعة", "at"]);

function stripWaw(word: string): string {
  return word.length > 2 && word.startsWith("و") ? word.slice(1) : word;
}

function readHour(word: string): { hour: number; minutes: number | null; period: "am" | "pm" | null } | null {
  const numeric = /^(\d{1,2})(?::(\d{2}))?(ص|م|am|pm)?$/.exec(word);
  if (numeric) {
    const hour = Number(numeric[1]);
    const minutes = numeric[2] ? Number(numeric[2]) : null;
    if (hour > 23 || (minutes !== null && minutes > 59)) return null;
    const suffix = numeric[3];
    const period = suffix === "ص" || suffix === "am" ? "am" : suffix === "م" || suffix === "pm" ? "pm" : null;
    return { hour, minutes, period };
  }
  const value = NUMBER_WORDS[word];
  return value ? { hour: value, minutes: null, period: null } : null;
}

function readFraction(tokens: AssistantToken[], index: number): { minutes: number; hourShift: number; used: number[] } | null {
  const word = tokens[index]?.norm;
  const nextWord = tokens[index + 1]?.norm;
  if (!word) return null;
  if (word === "ونص" || word === "ونصف") return { minutes: 30, hourShift: 0, used: [index] };
  if (word === "وربع") return { minutes: 15, hourShift: 0, used: [index] };
  if (word === "وتلت" || word === "وثلث") return { minutes: 20, hourShift: 0, used: [index] };
  if (word === "و" && nextWord) {
    if (nextWord === "نص" || nextWord === "نصف") return { minutes: 30, hourShift: 0, used: [index, index + 1] };
    if (nextWord === "ربع") return { minutes: 15, hourShift: 0, used: [index, index + 1] };
    if (nextWord === "تلت" || nextWord === "ثلث") return { minutes: 20, hourShift: 0, used: [index, index + 1] };
    if (/^\d{1,2}$/.test(nextWord) && Number(nextWord) < 60) {
      const used = [index, index + 1];
      if (/^(دقيقه|دقايق|دقائق|دقيقة)$/.test(tokens[index + 2]?.norm ?? "")) used.push(index + 2);
      return { minutes: Number(nextWord), hourShift: 0, used };
    }
  }
  if (word === "الا" && nextWord === "ربع") return { minutes: 45, hourShift: -1, used: [index, index + 1] };
  if (word === "الا" && (nextWord === "تلت" || nextWord === "ثلث")) {
    return { minutes: 40, hourShift: -1, used: [index, index + 1] };
  }
  return null;
}

function readPeriod(tokens: AssistantToken[], index: number): { period: DayPeriod; used: number[] } | null {
  const word = tokens[index]?.norm;
  if (!word) return null;
  if (word === "بعد" && NOON_WORDS.has(tokens[index + 1]?.norm ?? "")) return { period: "pm", used: [index, index + 1] };
  if (AM_WORDS.has(word)) return { period: "am", used: [index] };
  if (NOON_WORDS.has(word)) return { period: "noon", used: [index] };
  if (PM_WORDS.has(word)) return { period: "pm", used: [index] };
  if (NIGHT_WORDS.has(word)) return { period: "night", used: [index] };
  return null;
}

function resolveHour(hour: number, period: DayPeriod | null): number {
  if (hour > 12) return hour;
  if (period === "am") return hour === 12 ? 0 : hour;
  if (period === "noon") return hour >= 11 ? hour : hour + 12;
  if (period === "pm") return hour === 12 ? 12 : hour + 12;
  if (period === "night") {
    if (hour === 12) return 0;
    return hour <= 4 ? hour : hour + 12;
  }
  if (hour >= 1 && hour <= 7) return hour + 12;
  return hour;
}

export function extractTime(tokens: AssistantToken[]): ExtractedTime | null {
  for (let index = 0; index < tokens.length; index += 1) {
    const hasPrefix = HOUR_PREFIXES.has(tokens[index].norm);
    const hourIndex = hasPrefix ? index + 1 : index;
    const parsed = tokens[hourIndex] ? readHour(tokens[hourIndex].norm) : null;
    if (!parsed) continue;

    const used = hasPrefix ? [index, hourIndex] : [hourIndex];
    let cursor = hourIndex + 1;
    let minutes = parsed.minutes ?? 0;
    let hourShift = 0;
    const fraction = parsed.minutes === null ? readFraction(tokens, cursor) : null;
    if (fraction) {
      minutes = fraction.minutes;
      hourShift = fraction.hourShift;
      used.push(...fraction.used);
      cursor = fraction.used[fraction.used.length - 1] + 1;
    }
    const period = readPeriod(tokens, cursor);
    if (period) used.push(...period.used);

    const isClock = /:/.test(tokens[hourIndex].norm) || parsed.period !== null;
    if (!hasPrefix && !fraction && !period && !isClock) continue;

    const hour = (resolveHour(parsed.hour, period?.period ?? parsed.period) + hourShift + 24) % 24;
    return { time: `${pad(hour)}:${pad(minutes)}`, indices: used };
  }
  return null;
}

const TODAY_WORDS = new Set(["النهارده", "انهارده", "النهاردا", "النهرده", "نهارده", "اليوم", "today", "tonight"]);
const TOMORROW_WORDS = new Set(["بكره", "بكرا", "tomorrow"]);

const WEEKDAYS: Record<string, number> = {
  الحد: 0,
  الاحد: 0,
  حد: 0,
  احد: 0,
  sunday: 0,
  الاتنين: 1,
  الاثنين: 1,
  اتنين: 1,
  monday: 1,
  التلات: 2,
  التلاتا: 2,
  التلاتاء: 2,
  الثلاثاء: 2,
  الثلاثا: 2,
  تلات: 2,
  tuesday: 2,
  الاربع: 3,
  الاربعا: 3,
  الاربعاء: 3,
  اربع: 3,
  wednesday: 3,
  الخميس: 4,
  خميس: 4,
  thursday: 4,
  الجمعه: 5,
  جمعه: 5,
  friday: 5,
  السبت: 6,
  سبت: 6,
  saturday: 6,
};

function bareDateWord(word: string): string {
  const withoutWaw = stripWaw(word);
  if (withoutWaw.length > 3 && withoutWaw.startsWith("ل") && TOMORROW_WORDS.has(withoutWaw.slice(1))) {
    return withoutWaw.slice(1);
  }
  return withoutWaw;
}

export function extractDate(tokens: AssistantToken[], now: Date, skip: ReadonlySet<number> = new Set()): ExtractedDate | null {
  for (let index = 0; index < tokens.length; index += 1) {
    if (skip.has(index)) continue;
    const word = bareDateWord(tokens[index].norm);
    const next = tokens[index + 1]?.norm;

    if (word === "بعد" && next && TOMORROW_WORDS.has(bareDateWord(next))) {
      return { date: addLocalDays(now, 2), explicit: true, indices: [index, index + 1] };
    }
    if (TOMORROW_WORDS.has(word)) return { date: addLocalDays(now, 1), explicit: true, indices: [index] };
    if (TODAY_WORDS.has(word)) return { date: startOfLocalDay(now), explicit: true, indices: [index] };

    if ((word === "الاسبوع" || word === "اسبوع") && (next === "الجاي" || next === "الجاى" || next === "اللي")) {
      return { date: addLocalDays(now, 7), explicit: true, indices: [index, index + 1] };
    }

    const isDayWord = word === "يوم" || word === "ليوم";
    const dayCandidate = isDayWord ? next : word;
    const dayIndex = isDayWord ? index + 1 : index;
    if (!dayCandidate || skip.has(dayIndex)) continue;

    const weekday = WEEKDAYS[dayCandidate];
    const allowBare = dayCandidate.startsWith("ال") || /^[a-z]+$/.test(dayCandidate);
    if (weekday !== undefined && (isDayWord || allowBare)) {
      const today = now.getDay();
      const delta = ((weekday - today + 7) % 7) || 7;
      const indices = isDayWord ? [index, dayIndex] : [dayIndex];
      const after = tokens[dayIndex + 1]?.norm;
      if (after === "الجاي" || after === "الجايه" || after === "الجاى") indices.push(dayIndex + 1);
      return { date: addLocalDays(now, delta), explicit: true, indices };
    }

    if (isDayWord && /^\d{1,2}$/.test(dayCandidate)) {
      const dayOfMonth = Number(dayCandidate);
      if (dayOfMonth >= 1 && dayOfMonth <= 31) {
        let candidate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
        if (candidate < startOfLocalDay(now)) candidate = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
        return { date: candidate, explicit: true, indices: [index, dayIndex] };
      }
    }
  }
  return null;
}

const HIGH_WORDS = new Set(["مهم", "عاجل", "عاجله", "ضروري", "ضروريه", "urgent", "important"]);
const LOW_WORDS = new Set(["بسيط", "بسيطه", "low"]);
const NEGATIONS = new Set(["مش", "مو", "not"]);
const INTENSIFIERS = new Set(["جدا", "قوي", "اوي", "خالص", "very"]);

export function extractPriority(tokens: AssistantToken[]): ExtractedPriority | null {
  for (let index = 0; index < tokens.length; index += 1) {
    const word = tokens[index].norm;
    const next = tokens[index + 1]?.norm ?? "";
    if (NEGATIONS.has(word) && (HIGH_WORDS.has(next) || next === "مهمه")) {
      return { priority: "low", indices: [index, index + 1] };
    }
    if (HIGH_WORDS.has(word) || (word === "اولويه" && (next === "عاليه" || next === "عالي"))) {
      const indices = [index];
      if (word === "اولويه" || INTENSIFIERS.has(next)) indices.push(index + 1);
      return { priority: "high", indices };
    }
    if (word === "اولويه" && (next === "قليله" || next === "منخفضه")) return { priority: "low", indices: [index, index + 1] };
    if (LOW_WORDS.has(word)) return { priority: "low", indices: [index] };
    if (word === "high" && next === "priority") return { priority: "high", indices: [index, index + 1] };
    if (word === "low" && next === "priority") return { priority: "low", indices: [index, index + 1] };
  }
  return null;
}

const RELATIVE_TRIGGERS = new Set(["كمان", "بعد", "خلال", "in", "after"]);

const RELATIVE_NUMBERS: Record<string, number> = {
  واحد: 1,
  واحده: 1,
  اتنين: 2,
  اثنين: 2,
  تلاته: 3,
  ثلاثه: 3,
  تلات: 3,
  اربعه: 4,
  اربع: 4,
  خمسه: 5,
  خمس: 5,
  سته: 6,
  ست: 6,
  سبعه: 7,
  سبع: 7,
  تمانيه: 8,
  ثمانيه: 8,
  تمن: 8,
  تسعه: 9,
  تسع: 9,
  عشره: 10,
  عشر: 10,
  خمستاشر: 15,
  عشرين: 20,
  تلاتين: 30,
  اربعين: 40,
  خمسين: 50,
  one: 1,
  two: 2,
  three: 3,
  five: 5,
  ten: 10,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
};

const MINUTE_UNITS = new Set(["دقيقه", "دقايق", "دقائق", "دقيقة", "minute", "minutes", "min", "mins"]);
const HOUR_UNITS = new Set(["ساعه", "ساعات", "hour", "hours"]);
const DUAL_UNITS: Record<string, number> = { دقيقتين: 2, ساعتين: 120 };

function readAmount(word: string): number | null {
  if (/^\d+$/.test(word)) return Number(word);
  return RELATIVE_NUMBERS[word] ?? null;
}

function unitMinutes(word: string): number | null {
  if (MINUTE_UNITS.has(word)) return 1;
  if (HOUR_UNITS.has(word)) return 60;
  return null;
}

export function extractRelative(tokens: AssistantToken[], now: Date): ExtractedRelative | null {
  for (let index = 0; index < tokens.length; index += 1) {
    if (!RELATIVE_TRIGGERS.has(tokens[index].norm)) continue;
    const first = tokens[index + 1]?.norm;
    const second = tokens[index + 2]?.norm;
    if (!first) continue;

    let minutes: number | null = null;
    let used = [index, index + 1];

    if (first in DUAL_UNITS) {
      minutes = first === "دقيقتين" ? 2 : 120;
    } else if (unitMinutes(first) !== null) {
      minutes = unitMinutes(first);
      if (minutes === 60 && second === "ونص") {
        minutes = 90;
        used = [index, index + 1, index + 2];
      }
    } else if ((first === "نص" || first === "نصف") && second && HOUR_UNITS.has(second)) {
      minutes = 30;
      used = [index, index + 1, index + 2];
    } else if (first === "ربع" && second && HOUR_UNITS.has(second)) {
      minutes = 15;
      used = [index, index + 1, index + 2];
    } else {
      const amount = readAmount(first);
      const unit = second ? unitMinutes(second) : null;
      if (amount !== null && unit !== null) {
        minutes = amount * unit;
        used = [index, index + 1, index + 2];
        if (unit === 60 && tokens[index + 3]?.norm === "ونص") {
          minutes += 30;
          used.push(index + 3);
        }
      }
    }

    if (minutes === null || minutes <= 0) continue;
    const target = new Date(now.getTime() + minutes * 60_000);
    return {
      date: startOfLocalDay(target),
      time: `${pad(target.getHours())}:${pad(target.getMinutes())}`,
      indices: used,
    };
  }
  return null;
}
