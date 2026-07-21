import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, ArrowRight } from 'lucide-react';
import { getPhase, modulesInPhase, lessonCount, lessonSlug } from './learnConfig';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import { useVisited, readCount, firstUnread } from './progress';

// Per-track eyebrow tail (matches the canonical mock).
const TRACK_TAG: Record<string, string> = { 'personal-finance': 'Foundations', investment: 'Investing' };

export default function LearnPhase() {
  const { phaseSlug } = useParams();
  const phase = phaseSlug ? getPhase(phaseSlug) : undefined;
  usePageTitle(phase ? phase.name : undefined);
  const visited = useVisited();

  // First unread lesson that belongs to this track — the accordion's default-open
  // module and the "Resume" target.
  const resume = firstUnread(visited);
  const resumeInPhase = resume && phase && resume.module.phase === phase.name ? resume : undefined;
  const [open, setOpen] = useState<string | null>(resumeInPhase ? resumeInPhase.module.code : null);

  if (!phase) return <Navigate to="/learn" replace />;

  const mods = modulesInPhase(phase.name);
  const total = lessonCount(mods);
  const done = readCount(visited, mods.flatMap((m) => m.lessons.map((l) => l.id)));
  const resumeTarget = resumeInPhase ?? { module: mods[0], lessonId: mods[0].lessons[0].id };

  return (
    <div className="h-full flex flex-col">
      {/* toolbar: back to landing + breadcrumb */}
      <div className="shrink-0 flex items-center gap-2 h-[42px] px-3.5 bg-surface border-b border-hairline text-[11.5px]">
        <Link to="/learn" className="inline-flex items-center gap-1.5 text-mute hover:text-accent transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} /> Learning Hub
        </Link>
        <span className="text-faint">/</span>
        <span className="text-ink font-semibold">{phase.name}</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-canvas">
        <div className="max-w-[720px] mx-auto px-6 md:px-10 pt-9 pb-14">
          <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="w-[22px] h-[1.5px] bg-accent rounded" /> Phase {phase.num} · {TRACK_TAG[phase.slug] ?? ''}
          </div>
          <h1 className="mt-3 mb-2 text-[31px] font-extrabold tracking-[-0.025em] text-ink">{phase.name}</h1>
          <p className="text-[14px] text-mute leading-relaxed max-w-[58ch]">{phase.blurb}</p>

          {/* track progress + resume */}
          <div className="mt-[18px] flex flex-wrap items-center gap-3.5">
            <span className="flex-1 max-w-[260px] h-[7px] rounded-full bg-hairline-soft overflow-hidden">
              <i className="block h-full rounded-full os-track-fill" style={{ width: `${(done / total) * 100}%` }} />
            </span>
            <span className="text-[12px] text-mute"><b className="text-ink font-mono">{done}</b> of {total} lessons</span>
            <Link
              to={`/learn/${resumeTarget.module.slug}/${lessonSlug(resumeTarget.lessonId)}`}
              className="ml-auto inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-[12.5px] font-semibold px-3.5 py-2.5 rounded-md active:scale-[0.98] transition duration-200"
            >
              {done > 0 ? `Resume · ${resumeTarget.lessonId}` : 'Start'}
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
            </Link>
          </div>

          {/* module accordion */}
          <div className="mt-7 flex flex-col gap-3">
            {mods.map((m) => {
              const read = m.lessons.filter((l) => visited.has(l.id)).length;
              const isDone = read === m.lessons.length;
              const isOpen = open === m.code;
              const state = isDone ? ' · complete' : read > 0 ? ' · in progress' : '';
              return (
                <div key={m.code} className="os-card rounded-lg bg-surface overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : m.code)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-3 px-[18px] py-3.5 text-left hover:bg-sage-tint transition-colors"
                  >
                    <ChevronRight className={`w-[15px] h-[15px] text-faint shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} strokeWidth={2} />
                    <span className={`w-[26px] h-[26px] shrink-0 rounded-[7px] flex items-center justify-center text-[12px] font-bold font-mono ${isDone ? 'bg-accent text-white' : 'bg-sage-tint text-accent'}`}>
                      {m.code.replace('M', '')}
                    </span>
                    <span className="flex-1 min-w-0">
                      <b className="block text-[14px] font-bold text-ink">{m.title}</b>
                      <span className="text-[11.5px] text-faint">{m.lessons.length} lessons{state}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="w-[54px] h-[5px] rounded-full bg-hairline-soft overflow-hidden">
                        <i className="block h-full rounded-full bg-accent" style={{ width: `${(read / m.lessons.length) * 100}%` }} />
                      </span>
                      <span className="text-[11px] text-mute font-mono min-w-[30px] text-right">{read}/{m.lessons.length}</span>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-hairline-soft px-2 pt-1.5 pb-2.5">
                      {m.lessons.map((l) => {
                        const isRead = visited.has(l.id);
                        const isNow = resumeInPhase?.lessonId === l.id && resumeInPhase.module.code === m.code;
                        return (
                          <Link
                            key={l.id}
                            to={`/learn/${m.slug}/${lessonSlug(l.id)}`}
                            className={`flex items-center gap-[11px] px-3 py-2 rounded-md text-[13px] transition-colors ${isNow ? 'bg-sage-soft text-ink font-semibold' : 'text-mute hover:bg-sage-tint'}`}
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
