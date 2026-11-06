import type { AssistantToken } from "../types";

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function normalizeDigits(text: string): string {
  return text.replace(/[٠-٩۰-۹]/g, (char) => {
    const arabic = ARABIC_DIGITS.indexOf(char);
    return String(arabic >= 0 ? arabic : PERSIAN_DIGITS.indexOf(char));
  });
}

export function normalizeArabic(text: string): string {
  return normalizeDigits(text)
    .toLowerCase()
    .replace(/[ً-ٰٟۖ-ۭ]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/(\p{L})\1{2,}/gu, "$1$1");
}

const PUNCTUATION = /[^\p{L}\p{N}:]+/gu;

export function tokenize(text: string): AssistantToken[] {
  return normalizeDigits(text)
    .split(/\s+/)
    .map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(Boolean)
    .flatMap((raw) => {
      const norm = normalizeArabic(raw).replace(PUNCTUATION, "");
      return norm ? [{ raw, norm }] : [];
    });
}

export function stripArticle(word: string): string {
  if (word.length > 3 && word.startsWith("ال")) return word.slice(2);
  if (word.length > 3 && (word.startsWith("بال") || word.startsWith("وال") || word.startsWith("لل"))) {
    return word.slice(word.startsWith("لل") ? 2 : 3);
  }
  return word;
}

export function hasArabic(text: string): boolean {
  return /[؀-ۿ]/.test(text);
}
