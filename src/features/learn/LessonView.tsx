import { useId, useState, useEffect, useRef, type ReactNode } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Clock, Shield, Menu, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { findLesson, lessonSlug, phaseSlugForModule } from './learnConfig';
import { getLessonContent, LessonContent } from './content';
import { markVisited, useVisited } from './progress';
import { usePageTitle } from '../../shared/hooks/usePageTitle';

// Markdown in the reading body type.
function Markdown({ children }: { children: string }) {
  return (
    <div className="text-[15px] leading-[1.75] text-body [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:text-ink [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_ol]:space-y-1.5 [&_a]:text-accent [&_a]:underline">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}

// Sage-tint banner used for both "In 30 seconds" and "Key takeaway".
function Banner({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-sage-tint border border-sage-soft px-5 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent mb-1.5">{label}</p>
      <div className="text-[14px] leading-relaxed text-body">{children}</div>
    </div>
  );
}

function H2({ icon: Icon, children }: { icon: typeof Clock; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-[16px] font-bold text-ink mt-8 mb-3">
      <Icon className="w-4 h-4 text-accent" strokeWidth={1.7} />
      {children}
    </h2>
  );
}

function Quiz({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const answerId = useId();
  return (
    <div className="rounded-xl border border-hairline bg-canvas px-5 py-[18px] my-7">
      <p className="text-[10px] uppercase tracking-[0.12em] text-faint font-bold mb-2">Quick check</p>
      <p className="text-[14.5px] text-ink font-semibold leading-relaxed mb-3.5">{q}</p>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls={answerId}
          className="inline-flex items-center gap-1.5 bg-surface text-accent text-[12.5px] font-semibold border border-sage-soft rounded-lg px-3.5 py-2 hover:border-accent active:scale-[0.97] transition duration-200 cursor-pointer"
        >
          Reveal answer <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      ) : (
        <motion.div id={answerId} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.25, ease: 'easeOut' }} className="overflow-hidden">
          <div className="pt-1"><Markdown>{a}</Markdown></div>
        </motion.div>
      )}
    </div>
  );
}

export default function LessonView() {
  const { moduleSlug, lessonSlug: lSlug } = useParams();
  const loc = moduleSlug && lSlug ? findLesson(moduleSlug, lSlug) : undefined;
  usePageTitle(loc ? `${loc.lesson.id} · ${loc.lesson.title}` : undefined);
  const visited = useVisited();

  const [c, setC] = useState<LessonContent | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [narrow, setNarrow] = useState(false);
  const [treeOpen, setTreeOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<HTMLElement>(null);

  const moduleCode = loc?.module.code;
  const lessonId = loc?.lesson.id;

  useEffect(() => {
    if (!moduleCode || !lessonId) return;
    let cancelled = false;
    setLoading(true);
    setC(undefined);
    getLessonContent(moduleCode, lessonId).then((res) => {
      if (!cancelled) { setC(res); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [moduleCode, lessonId]);

  useEffect(() => { if (lessonId) markVisited(lessonId); }, [lessonId]);
  useEffect(() => { readRef.current?.scrollTo(0, 0); setTreeOpen(false); }, [lessonId]);

  // Container-width breakpoint: the interior reflows to window width, not the
  // viewport (windows resize). Under 640px the section-index becomes an overlay.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setNarrow(el.clientWidth < 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!loc) return <Navigate to="/learn" replace />;

  const { module, lesson, prev, next } = loc;
  const idx = module.lessons.findIndex((l) => l.id === lesson.id);
  const done = module.lessons.filter((l) => visited.has(l.id)).length;

  const NavArrow = ({ to, title, disabled, children }: { to?: string; title?: string; disabled: boolean; children: ReactNode }) =>
    disabled || !to ? (
      <span className="w-[26px] h-6 flex items-center justify-center border border-hairline rounded-md text-faint opacity-40">{children}</span>
    ) : (
      <Link to={to} title={title} className="w-[26px] h-6 flex items-center justify-center border border-hairline rounded-md text-mute hover:border-accent hover:text-accent transition-colors">{children}</Link>
    );

  const sectionIndex = (
    <aside
      className={`w-[246px] shrink-0 border-r border-hairline bg-surface overflow-y-auto p-4 text-[12.5px] ${
        narrow ? `absolute top-0 left-0 bottom-0 z-20 shadow-2xl ${treeOpen ? 'block' : 'hidden'}` : 'hidden lg:block'
      }`}
    >
      <Link to={`/learn/phase/${phaseSlugForModule(module)}`} className="flex items-center gap-1.5 text-[11.5px] text-mute hover:text-accent px-2 pb-3 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} /> All modules
      </Link>
      <div className="px-2 pb-2.5 mb-2 border-b border-hairline-soft">
        <span className="block text-[13px] font-bold text-ink leading-tight">{module.title}</span>
        <span className="text-[10.5px] text-faint font-mono">Module {module.code.replace('M', '')} · {done}/{module.lessons.length}</span>
      </div>
      <div className="flex flex-col gap-px">
        {module.lessons.map((l) => {
          const isNow = l.id === lesson.id;
          const isRead = visited.has(l.id);
          return (
            <Link
              key={l.id}
              to={`/learn/${module.slug}/${lessonSlug(l.id)}`}
              className={`flex items-center gap-[9px] px-[9px] py-[7px] rounded-md transition-colors ${isNow ? 'bg-sage-soft text-ink font-semibold' : 'text-mute hover:bg-sage-tint'}`}
            >
              <span className="w-3.5 flex justify-center shrink-0">
                {isRead && !isNow ? (
                  <Check className="w-3.5 h-3.5 text-accent" strokeWidth={2.3} />
                ) : (
                  <i className={`w-1.5 h-1.5 rounded-full ${isNow ? 'bg-accent' : 'bg-hairline'}`} />
                )}
              </span>
              {l.title}
            </Link>
          );
        })}
      </div>
    </aside>
  );

  return (
    <div ref={rootRef} className="h-full flex flex-col relative">
      {/* Toolbar: ☰ (narrow) · module name · prev / pos / next */}
      <div className="shrink-0 flex items-center gap-2.5 h-[42px] px-3.5 bg-surface border-b border-hairline">
        {narrow && (
          <button type="button" onClick={() => setTreeOpen((v) => !v)} aria-label="Lessons in this module" className="text-mute hover:text-ink px-1.5 py-0.5 rounded -ml-1">
            <Menu className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>
        )}
        <span className="text-[11.5px] text-mute font-medium truncate">{module.title}</span>
        <span className="ml-auto flex items-center gap-1.5">
          <NavArrow to={prev ? `/learn/${prev.module.slug}/${lessonSlug(prev.lesson.id)}` : undefined} title={prev ? `Previous — ${prev.lesson.title}` : undefined} disabled={!prev}>
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.9} />
          </NavArrow>
          <span className="font-mono text-[11.5px] text-faint min-w-[36px] text-center">{idx + 1} / {module.lessons.length}</span>
          <NavArrow to={next ? `/learn/${next.module.slug}/${lessonSlug(next.lesson.id)}` : undefined} title={next ? `Next — ${next.lesson.title}` : undefined} disabled={!next}>
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.9} />
          </NavArrow>
        </span>
      </div>

      <div className="flex-1 min-h-0 flex relative">
        {narrow && treeOpen && <div className="absolute inset-0 z-10 bg-ink/10" onClick={() => setTreeOpen(false)} aria-hidden="true" />}
        {sectionIndex}

        <article ref={readRef} className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-[680px] mx-auto px-6 md:px-11 py-10">
            <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              <span className="w-[22px] h-[1.5px] bg-accent rounded" /> Lesson {lesson.id.replace(/^L/, '')}
            </div>
            <h1 className="mt-3.5 mb-6 text-[29px] font-extrabold tracking-[-0.025em] leading-[1.1] text-ink">{lesson.title}</h1>

            {loading ? (
              <div className="flex items-center gap-2 text-[14px] text-faint" role="status" aria-label="Loading lesson">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading lesson…
              </div>
            ) : !c ? (
              <p className="text-[14px] text-mute leading-relaxed">This lesson is being written — check back soon.</p>
            ) : (
              <>
                <p className="text-[16px] leading-relaxed text-ink font-medium mb-5">{c.hook}</p>
                <Banner label="In 30 seconds">{c.summary}</Banner>
                <H2 icon={Clock}>Understand it</H2>
                <Markdown>{c.body}</Markdown>
                {c.example && (
                  <div className="rounded-xl border border-hairline bg-canvas px-5 py-4 mt-4">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-faint font-bold mb-1.5">Example</p>
                    <p className="text-[14px] text-body leading-relaxed">{c.example}</p>
                  </div>
                )}
                {c.malaysia && (
                  <>
                    <H2 icon={Shield}>In Malaysia</H2>
                    <Markdown>{c.malaysia}</Markdown>
                  </>
                )}
                {c.quiz && <Quiz key={lesson.id} q={c.quiz.q} a={c.quiz.a} />}
                <Banner label="Key takeaway">{c.takeaway}</Banner>
                <div className="rounded-xl border border-accent/25 bg-accent/[0.04] px-5 py-4 mt-6">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-accent font-bold mb-1.5">Do this now</p>
                  <p className="text-[14px] text-body leading-relaxed">{c.action}</p>
                </div>
                {c.sources && <p className="mt-6 text-[11px] text-faint leading-relaxed">Sources: {c.sources}</p>}
              </>
            )}

            {/* pager */}
            <div className="flex justify-between gap-4 border-t border-hairline pt-5 mt-9 text-[13px]">
              {prev ? (
                <Link to={`/learn/${prev.module.slug}/${lessonSlug(prev.lesson.id)}`} className="flex flex-col gap-0.5 text-mute hover:text-ink transition-colors">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-faint">← Previous</span>
                  <span className="font-medium">{prev.lesson.id} · {prev.lesson.title}</span>
                </Link>
              ) : <span />}
              {next ? (
                <Link to={`/learn/${next.module.slug}/${lessonSlug(next.lesson.id)}`} className="flex flex-col gap-0.5 text-right ml-auto text-mute hover:text-ink transition-colors">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-faint">Next →</span>
                  <span className="font-semibold text-accent">{next.lesson.id} · {next.lesson.title}</span>
                </Link>
              ) : <span />}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
