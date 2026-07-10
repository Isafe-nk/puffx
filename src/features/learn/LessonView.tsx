import { useId, useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Info, Check, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AlertBanner from '../../shared/components/AlertBanner';
import { findLesson, lessonSlug } from './learnConfig';
import { getLessonContent, LessonContent } from './content';
import { markVisited } from './progress';
import { usePageTitle } from '../../shared/hooks/usePageTitle';

// Renders a markdown string in the muted body type used across Learn.
function Markdown({ children, className = '' }: { children: string; className?: string }) {
  return (
    <div
      className={`text-[14px] text-[#44474D] leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:text-[#212121] [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_ol]:space-y-1.5 [&_a]:text-[#D91222] [&_a]:underline ${className}`}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}

function Quiz({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const answerId = useId();
  return (
    <div className="rounded-2xl border border-[#E6E6E6] bg-white p-5 md:p-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#A2A3A5] font-semibold mb-2">Quick check</p>
      <p className="text-[14px] text-[#212121] font-medium leading-relaxed">{q}</p>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls={answerId}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#D91222] hover:text-[#C01A2F] active:scale-[0.97] transition duration-200 cursor-pointer"
        >
          Reveal answer
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      ) : (
        <motion.div
          id={answerId}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="mt-4 pt-4 border-t border-[#EEEEEE]">
            <Markdown>{a}</Markdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}

const SECTION_LABEL = 'text-[10px] uppercase tracking-[0.2em] text-[#A2A3A5] font-semibold';

export default function LessonView() {
  const { moduleSlug, lessonSlug: lSlug } = useParams();
  const loc = moduleSlug && lSlug ? findLesson(moduleSlug, lSlug) : undefined;
  usePageTitle(loc ? `${loc.lesson.id} · ${loc.lesson.title}` : undefined);

  // Content lives in a per-module chunk, fetched on open. The page shell (header,
  // prev/next) renders from config immediately; only the body waits.
  const [c, setC] = useState<LessonContent | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const moduleCode = loc?.module.code;
  const lessonId = loc?.lesson.id;

  useEffect(() => {
    if (!moduleCode || !lessonId) return;
    let cancelled = false;
    setLoading(true);
    setC(undefined);
    getLessonContent(moduleCode, lessonId).then((res) => {
      if (!cancelled) {
        setC(res);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [moduleCode, lessonId]);

  // Opening a lesson marks it read (v1: low-friction, no explicit "done" button).
  useEffect(() => {
    if (lessonId) markVisited(lessonId);
  }, [lessonId]);

  // Unknown module/lesson → back to the Learn landing.
  if (!loc) return <Navigate to="/learn" replace />;

  const { module, lesson, prev, next } = loc;

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pb-20">

        {/* Header */}
        <div className="pt-12 lg:pt-16">
          <Link
            to={`/learn/${module.slug}`}
            className="inline-flex items-center gap-1 text-[11px] text-[#727579] hover:text-[#212121] font-medium mb-7 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> {module.title}
          </Link>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-px bg-[#D91222]" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#A2A3A5] font-semibold font-mono">{lesson.id}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black font-display tracking-tight text-[#212121] leading-tight">{lesson.title}</h1>
        </div>

        {loading ? (
          <div className="mt-10 flex items-center gap-2 text-[14px] text-[#A2A3A5]" role="status" aria-label="Loading lesson">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading lesson…
          </div>
        ) : !c ? (
          <p className="mt-8 text-[14px] text-[#727579] leading-relaxed">
            This lesson is being written — check back soon.
          </p>
        ) : (
          <div className="mt-8 space-y-8">
            {/* recall */}
            {c.recall && <p className="text-[12px] text-[#A2A3A5] leading-relaxed">{c.recall}</p>}

            {/* hook — the lesson's opening read */}
            <p className="text-[17px] text-[#44474D] leading-relaxed">{c.hook}</p>

            {/* summary */}
            <AlertBanner type="info" title="In 30 seconds" icon={<Info className="w-4 h-4" strokeWidth={1.5} />}>
              {c.summary}
            </AlertBanner>

            {/* body */}
            <Markdown>{c.body}</Markdown>

            {/* example */}
            {c.example && (
              <div className="rounded-2xl border border-[#E6E6E6] bg-[#F7F8FA] p-5 md:p-6">
                <p className={`${SECTION_LABEL} mb-2`}>Example</p>
                <p className="text-[14px] text-[#44474D] leading-relaxed">{c.example}</p>
              </div>
            )}

            {/* malaysia */}
            {c.malaysia && (
              <div>
                <p className={`${SECTION_LABEL} mb-3`}>In Malaysia</p>
                <Markdown>{c.malaysia}</Markdown>
              </div>
            )}

            {/* quiz */}
            {c.quiz && <Quiz key={lesson.id} q={c.quiz.q} a={c.quiz.a} />}

            {/* takeaway */}
            <AlertBanner type="success" title="Key takeaway" icon={<Check className="w-4 h-4" strokeWidth={1.5} />}>
              {c.takeaway}
            </AlertBanner>

            {/* action */}
            <div className="rounded-2xl border border-[#D91222]/25 bg-[#D91222]/[0.04] p-5 md:p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#D91222] font-semibold mb-2">Do this now</p>
              <p className="text-[14px] text-[#44474D] leading-relaxed">{c.action}</p>
            </div>

            {/* sources */}
            {c.sources && (
              <p className="text-[11px] text-[#A2A3A5] leading-relaxed">Sources: {c.sources}</p>
            )}
          </div>
        )}

        {/* prev / next — rolls over module boundaries; next stacks first on mobile */}
        <div className="mt-12 pt-8 border-t border-[#E6E6E6] grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prev ? (
            <Link
              to={`/learn/${prev.module.slug}/${lessonSlug(prev.lesson.id)}`}
              className="group order-2 sm:order-1 rounded-xl border border-[#E6E6E6] p-4 hover:border-[#D91222] active:scale-[0.99] transition duration-200"
            >
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-[#A2A3A5] font-semibold mb-1">
                <ChevronLeft className="w-3 h-3" strokeWidth={1.5} />
                {prev.crossModule ? `Previous module · ${prev.module.code} ${prev.lesson.id}` : 'Previous'}
              </span>
              <span className="block text-[13px] font-semibold text-[#212121]">{prev.lesson.title}</span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
          {next ? (
            <Link
              to={`/learn/${next.module.slug}/${lessonSlug(next.lesson.id)}`}
              className="group order-1 sm:order-2 rounded-xl border border-[#E6E6E6] p-4 hover:border-[#D91222] active:scale-[0.99] transition duration-200 text-right"
            >
              <span className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-[0.18em] text-[#A2A3A5] font-semibold mb-1">
                {next.crossModule ? `Next module · ${next.module.code} ${next.lesson.id}` : 'Next'}
                <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
              </span>
              <span className="block text-[13px] font-semibold text-[#212121]">{next.lesson.title}</span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>
      </div>
    </div>
  );
}
