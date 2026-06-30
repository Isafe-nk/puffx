import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Landmark, Wallet, LineChart } from 'lucide-react';
import { PHASES, LEARN_MODULES, modulesInPhase, lessonCount } from './learnConfig';

const PHASE_ICONS = [Wallet, LineChart];

export default function Learn() {
  return (
    <div className="w-full">
      <header className="border-b border-[#E6E6E6] bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D91222]/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-[#D91222]" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-[#212121]">FFM — Finance for Malaysians</h1>
            <p className="text-xs text-[#727579] font-sans mt-0.5">
              {LEARN_MODULES.length} modules · {lessonCount(LEARN_MODULES)} bite-sized lessons
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 lg:p-6 space-y-8">
        {/* Intro */}
        <section className="space-y-3">
          <h2 className="text-2xl lg:text-3xl font-black font-display text-[#212121] tracking-tight">
            Money skills school never taught you.
          </h2>
          <p className="text-sm text-[#44474D] leading-relaxed max-w-2xl">
            A plain-English finance course for Malaysian professionals — no jargon, no products being sold.
            It ramps from beginner to confident investor in two phases: first get your personal finances solid,
            then learn to grow your money. Each lesson is one small, ~30-second idea.
          </p>
        </section>

        {/* Two phases as the entry points */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PHASES.map((p, i) => {
            const mods = modulesInPhase(p.name);
            const Icon = PHASE_ICONS[i] ?? GraduationCap;
            return (
              <Link
                key={p.slug}
                to={`/learn/phase/${p.slug}`}
                className="group glass-card rounded-2xl p-6 border border-[#E6E6E6] hover:border-[#D91222] hover:shadow-md transition-all duration-200 block"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E6E6E6] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#D91222]" />
                  </div>
                  <span className="text-[10px] text-[#A2A3A5] font-mono">{mods.length} modules · {lessonCount(mods)} lessons</span>
                </div>
                <div className="text-[10px] text-[#727579] font-semibold uppercase tracking-[0.15em] mb-1">Phase {p.num}</div>
                <h3 className="text-lg font-bold font-display text-[#212121] mb-1.5 flex items-center gap-1.5">
                  {p.name}
                  <ArrowRight className="w-4 h-4 text-[#A2A3A5] group-hover:text-[#D91222] group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-[13px] text-[#727579] leading-relaxed">{p.blurb}</p>
              </Link>
            );
          })}
        </section>

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
