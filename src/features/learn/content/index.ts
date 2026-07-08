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

type ModuleContent = Record<string, LessonContent>;

// Each module's prose is its own chunk, imported on demand — keeps all 68
// lessons (~132 kB) out of the main bundle. Vite caches the fetched chunk;
// we also memo the parsed module so repeat lookups are synchronous-fast.
const LOADERS: Record<string, () => Promise<{ default: ModuleContent }>> = {
  M0: () => import('./m0.json'),
  M1: () => import('./m1.json'),
  M2: () => import('./m2.json'),
  M3: () => import('./m3.json'),
  M4: () => import('./m4.json'),
  M5: () => import('./m5.json'),
  M6: () => import('./m6.json'),
  M7: () => import('./m7.json'),
  M8: () => import('./m8.json'),
};

const cache = new Map<string, ModuleContent>();

/** Load one lesson's content, fetching (and caching) its module chunk on demand. */
export async function getLessonContent(
  moduleCode: string,
  lessonId: string
): Promise<LessonContent | undefined> {
  let mod = cache.get(moduleCode);
  if (!mod) {
    const loader = LOADERS[moduleCode];
    if (!loader) return undefined;
    mod = (await loader()).default;
    cache.set(moduleCode, mod);
  }
  return mod[lessonId];
}
