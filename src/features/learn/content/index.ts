import m0 from './m0.json';
import m1 from './m1.json';
import m2 from './m2.json';
import m3 from './m3.json';
import m4 from './m4.json';
import m5 from './m5.json';
import m6 from './m6.json';
import m7 from './m7.json';
import m8 from './m8.json';

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
export const MODULE_CONTENT: Record<string, Record<string, LessonContent>> = {
  M0: m0 as Record<string, LessonContent>,
  M1: m1 as Record<string, LessonContent>,
  M2: m2 as Record<string, LessonContent>,
  M3: m3 as Record<string, LessonContent>,
  M4: m4 as Record<string, LessonContent>,
  M5: m5 as Record<string, LessonContent>,
  M6: m6 as Record<string, LessonContent>,
  M7: m7 as Record<string, LessonContent>,
  M8: m8 as Record<string, LessonContent>,
};

export const getLessonContent = (moduleCode: string, lessonId: string): LessonContent | undefined =>
  MODULE_CONTENT[moduleCode]?.[lessonId];

export const moduleHasContent = (moduleCode: string): boolean => !!MODULE_CONTENT[moduleCode];
