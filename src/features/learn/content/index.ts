import m0 from './m0.json';

export interface LessonContent {
  hook: string;
  recall?: string;
  summary: string;
  body: string;
  example?: string;
  malaysia?: string;
  quiz?: { q: string; a: string };
  takeaway: string;
  action: string;
  sources?: string;
}

// Lesson content keyed by module code (M0…M8), then by lesson id (L0.1…).
// Add m1.json … m8.json here as they are written.
export const MODULE_CONTENT: Record<string, Record<string, LessonContent>> = {
  M0: m0 as Record<string, LessonContent>,
};

export const getLessonContent = (moduleCode: string, lessonId: string): LessonContent | undefined =>
  MODULE_CONTENT[moduleCode]?.[lessonId];

export const moduleHasContent = (moduleCode: string): boolean => !!MODULE_CONTENT[moduleCode];
