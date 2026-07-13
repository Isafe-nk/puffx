import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { getPhase, modulesInPhase, lessonCount } from './learnConfig';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import { useVisited, readCount } from './progress';

export default function LearnPhase() {
  const { phaseSlug } = useParams();
  const phase = phaseSlug ? getPhase(phaseSlug) : undefined;
  usePageTitle(phase ? `Phase ${phase.num} · ${phase.name}` : undefined);
  const visited = useVisited();

  if (!phase) return <Navigate to="/learn" replace />;

  const mods = modulesInPhase(phase.name);
  const phaseRead = readCount(visited, mods.flatMap((m) => m.lessons.map((l) => l.id)));

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">

        {/* Header */}
        <div className="pt-12 lg:pt-16">
          <Link to="/learn" className="inline-flex items-center gap-1 text-[11px] text-[#75806F] hover:text-[#243129] font-medium mb-7 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> Finance for Malaysians
          </Link>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-px bg-[#3E7355]" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#9AA394] font-semibold">Phase {phase.num}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black font-display tracking-tight text-[#243129] leading-tight">{phase.name}</h1>
          <p className="mt-4 text-[15px] text-[#75806F] leading-relaxed max-w-2xl">{phase.blurb}</p>
          <p className="mt-3 text-[12px] text-[#9AA394] font-mono">
            {mods.length} modules · {lessonCount(mods)} lessons
            {phaseRead > 0 && <span className="text-[#3E7355]"> · {phaseRead} read</span>}
          </p>
        </div>

        {/* Modules */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {mods.map((m) => (
            <Link
              key={m.slug}
              to={`/learn/${m.slug}`}
              className="group rounded-lg border border-[#DCE0D2] bg-white p-6 hover:border-[#3E7355] active:scale-[0.99] transition duration-200 block"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-semibold text-[#75806F]">Module {m.code.replace('M', '')}</span>
                <span className="text-[11px] text-[#9AA394] font-mono">
                  {(() => {
                    const r = readCount(visited, m.lessons.map((l) => l.id));
                    return r > 0 ? <><span className="text-[#3E7355]">{r}/{m.lessons.length} read</span></> : `${m.lessons.length} lessons`;
                  })()}
                </span>
              </div>
              <h2 className="text-base font-bold font-display text-[#243129] flex items-center gap-1.5">
                {m.title}
                <ArrowRight className="w-4 h-4 text-[#3E7355] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" strokeWidth={1.5} />
              </h2>
              <p className="mt-2 text-[13px] text-[#75806F] leading-relaxed">{m.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
