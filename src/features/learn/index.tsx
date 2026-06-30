import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Landmark } from 'lucide-react';
import { LEARN_MODULES } from './learnConfig';

const PHASES = ['Personal Finance', 'Investment'];

export default function Learn() {
  return (
    <div className="w-full">
      <header className="border-b border-[#E6E6E6] bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D91222]/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-[#D91222]" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-[#212121]">Learn — Finance for Malaysians</h1>
            <p className="text-xs text-[#727579] font-sans mt-0.5">
              From zero financial schooling to confident investor · {LEARN_MODULES.length} modules · {LEARN_MODULES.reduce((n, m) => n + m.lessons.length, 0)} lessons
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 lg:p-6 space-y-8">
        {PHASES.map((phase, pi) => (
          <section key={phase} className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] text-[#727579] font-semibold uppercase tracking-[0.15em]">
              <span className="w-0.5 h-4 bg-[#D91222] rounded-full"></span>
              Phase {pi + 1} · {phase}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEARN_MODULES.filter((m) => m.phase === phase).map((m) => (
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
          </section>
        ))}

        <div className="flex items-start gap-2.5 text-[11px] text-[#727579] leading-normal bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E6E6E6]">
          <Landmark className="w-3.5 h-3.5 text-[#D91222] shrink-0 mt-0.5" />
          <span>
            Educational only — not financial advice. Lesson content is being written and verified;
            Malaysia-specific figures (EPF rates, tax reliefs) are confirmed against current sources before publishing.
          </span>
        </div>
      </main>
    </div>
  );
}
