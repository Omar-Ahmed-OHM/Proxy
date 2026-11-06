import type { MatchableTask, TaskMatch } from "../types";
import { normalizeArabic, stripArticle } from "./normalize";

const IGNORED = new Set(["مهمه", "تاسك", "task", "the", "a", "علي", "على", "في", "من", "و"]);

function keyTokens(text: string): string[] {
  return normalizeArabic(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word && !IGNORED.has(word))
    .map(stripArticle);
}

function similar(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) return true;
  return false;
}

function score(query: string[], title: string[]): number {
  if (query.length === 0 || title.length === 0) return 0;
  const hits = query.filter((word) => title.some((candidate) => similar(word, candidate))).length;
  return hits / query.length + hits / (title.length * 4);
}

export function findTask<T extends MatchableTask>(query: string, tasks: ReadonlyArray<T>): TaskMatch<T> {
  const queryTokens = keyTokens(query);
  const ranked = tasks
    .map((task) => ({ task, value: score(queryTokens, keyTokens(task.title)) }))
    .filter((item) => item.value >= 0.5)
    .sort((a, b) => b.value - a.value);

  if (ranked.length === 0) return { best: null, candidates: [], ambiguous: false };
  const [first, second] = ranked;
  const ambiguous = Boolean(second && Math.abs(first.value - second.value) < 0.05);
  return {
    best: ambiguous ? null : first.task,
    candidates: ranked.slice(0, 3).map((item) => item.task),
    ambiguous,
  };
}
