import { useSyncExternalStore, useMemo } from 'react';
import { LEARN_MODULES, lessonSlug, type LearnModule } from './learnConfig';

// v1 progress: which lessons the reader has opened, in localStorage under one
// key. No accounts, no backend — this is the MVP boundary we can later swap for
// a server without changing the component API (useVisited / markVisited).
const KEY = 'ffm:progress';

function load(): string[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

// In-memory snapshot; its reference only changes when the set changes, which is
// what useSyncExternalStore needs to avoid infinite re-renders.
let visited: string[] = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(KEY, JSON.stringify(visited));
  } catch {
    /* storage unavailable (private mode / quota) — stay in-memory for the session */
  }
}

/** Record that a lesson has been opened. No-op if already recorded. */
export function markVisited(lessonId: string) {
  if (visited.includes(lessonId)) return;
  visited = [...visited, lessonId];
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // Reflect changes made in other tabs.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      visited = load();
      cb();
    }
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): string[] {
  return visited;
}

/** Reactive set of visited lesson IDs. */
export function useVisited(): Set<string> {
  const arr = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return useMemo(() => new Set(arr), [arr]);
}

// Every curriculum lesson flattened in reading order (phase → module → lesson);
// LEARN_MODULES is already in that order.
export const ALL_LESSONS: { module: LearnModule; lessonId: string }[] = LEARN_MODULES.flatMap(
  (module) => module.lessons.map((l) => ({ module, lessonId: l.id }))
);

export const TOTAL_LESSONS = ALL_LESSONS.length;

/** Count of the given lesson IDs that have been read. */
export function readCount(visited: Set<string>, lessonIds: string[]): number {
  return lessonIds.reduce((n, id) => (visited.has(id) ? n + 1 : n), 0);
}

/** First lesson not yet read, in reading order — the "Continue" target. */
export function firstUnread(visited: Set<string>): { module: LearnModule; lessonId: string } | undefined {
  return ALL_LESSONS.find((l) => !visited.has(l.lessonId));
}

/** Route path for a lesson. */
export function lessonPath(module: LearnModule, lessonId: string): string {
  return `/learn/${module.slug}/${lessonSlug(lessonId)}`;
}
