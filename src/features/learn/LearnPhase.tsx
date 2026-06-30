import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { getPhase, modulesInPhase, lessonCount } from './learnConfig';

export default function LearnPhase() {
  const { phaseSlug } = useParams();
  const phase = phaseSlug ? getPhase(phaseSlug) : undefined;

  if (!phase) return <Navigate to="/learn" replace />;

  const mods = modulesInPhase(phase.name);

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">

        {/* Header */}
        <div className="pt-12 lg:pt-16">
          <Link to="/learn" className="inline-flex items-center gap-1 text-[11px] text-[#727579] hover:text-[#212121] font-medium mb-7 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> Finance for Malaysians
          </Link>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-px bg-[#D91222]" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#A2A3A5] font-semibold">Phase {phase.num}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black font-display tracking-tight text-[#212121] leading-tight">{phase.name}</h1>
          <p className="mt-4 text-[15px] text-[#727579] leading-relaxed max-w-2xl">{phase.blurb}</p>
          <p className="mt-3 text-[12px] text-[#A2A3A5] font-mono">{mods.length} modules · {lessonCount(mods)} lessons</p>
        </div>

        {/* Modules */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {mods.map((m) => (
            <Link
              key={m.slug}
              to={`/learn/${m.slug}`}
              className="group rounded-2xl border border-[#E6E6E6] bg-white p-6 hover:border-[#D91222] transition-colors duration-200 block"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-semibold text-[#727579]">Module {m.code.replace('M', '')}</span>
                <span className="text-[11px] text-[#A2A3A5] font-mono">{m.lessons.length} lessons</span>
              </div>
              <h2 className="text-base font-bold font-display text-[#212121] flex items-center gap-1.5">
                {m.title}
                <ArrowRight className="w-4 h-4 text-[#D91222] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" strokeWidth={1.5} />
              </h2>
              <p className="mt-2 text-[13px] text-[#727579] leading-relaxed">{m.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
