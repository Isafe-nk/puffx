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
      <header className="border-b border-[#E6E6E6] bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <Link to="/learn" className="inline-flex items-center gap-1 text-[11px] text-[#727579] hover:text-[#212121] font-medium mb-2 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> FFM home
          </Link>
          <div className="text-[10px] text-[#727579] font-semibold uppercase tracking-[0.15em] mb-0.5">Phase {phase.num}</div>
          <h1 className="text-xl font-bold font-display tracking-tight text-[#212121]">{phase.name}</h1>
          <p className="text-xs text-[#727579] font-sans mt-1">
            {mods.length} modules · {lessonCount(mods)} lessons — {phase.blurb}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mods.map((m) => (
            <Link
              key={m.slug}
              to={`/learn/${m.slug}`}
              className="group glass-card rounded-2xl p-5 border border-[#E6E6E6] hover:border-[#D91222] hover:shadow-md transition-all duration-200 block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-[#D91222] bg-[#D91222]/10 px-2 py-0.5 rounded">{m.code}</span>
                <span className="text-[10px] text-[#A2A3A5] font-mono">{m.lessons.length} lessons · {m.level}</span>
              </div>
              <h2 className="text-base font-bold font-display text-[#212121] mb-1 flex items-center gap-1.5">
                {m.title}
                <ArrowRight className="w-3.5 h-3.5 text-[#A2A3A5] group-hover:text-[#D91222] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-[13px] text-[#727579] leading-relaxed">{m.blurb}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
