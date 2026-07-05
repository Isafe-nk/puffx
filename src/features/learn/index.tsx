import { Link } from 'react-router-dom';
import { ListOrdered, Scale, MapPin, Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import { PHASES, LEARN_MODULES, modulesInPhase, lessonCount } from './learnConfig';

const FIRST_MODULE = LEARN_MODULES[0];

const PHASE_ICONS = [Wallet, TrendingUp];

const PRINCIPLES = [
  { icon: ListOrdered, title: 'Go in order', desc: 'Start at Module 0 — each lesson builds on the one before.' },
  { icon: Scale, title: 'Independent & neutral', desc: 'We explain the options and never sell a product.' },
  { icon: MapPin, title: 'Built for Malaysia', desc: 'EPF, LHDN, ASB and the local vehicles, in plain English.' },
];

export default function Learn() {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">

        {/* Hero — typography led, single red accent */}
        <section className="pt-16 lg:pt-24 pb-12">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-6 h-px bg-[#D91222]" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#A2A3A5] font-semibold">Free · self-paced</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black font-display tracking-tight text-[#212121] leading-[1.05]">
            Finance for Malaysians
          </h1>
          <p className="mt-5 text-lg text-[#727579] leading-relaxed max-w-2xl">
            Money the way school never taught you — from your first payslip to building real wealth.
          </p>
          <Link
            to={`/learn/${FIRST_MODULE.slug}`}
            className="group mt-8 inline-flex items-center gap-2 bg-[#D91222] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#C01A2F] active:scale-[0.98] transition duration-200"
          >
            Start with Module 0
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
          </Link>
        </section>

        {/* How it works — principles, not counts */}
        <section className="mb-14 border-t border-[#E6E6E6] pt-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#A2A3A5] font-semibold mb-6">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-7">
            {PRINCIPLES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-2">
                <Icon className="w-4 h-4 text-[#A2A3A5]" strokeWidth={1.5} />
                <h3 className="text-[13px] font-semibold text-[#212121]">{title}</h3>
                <p className="text-[12px] text-[#727579] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Two phases — orientation, not every module */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PHASES.map((p, i) => {
            const mods = modulesInPhase(p.name);
            const Icon = PHASE_ICONS[i] ?? Wallet;
            return (
              <Link
                key={p.slug}
                to={`/learn/phase/${p.slug}`}
                className="group rounded-2xl border border-[#E6E6E6] bg-white p-6 hover:border-[#D91222] active:scale-[0.99] transition duration-200 block"
              >
                <div className="flex items-center justify-between mb-6">
                  <Icon className="w-5 h-5 text-[#727579]" strokeWidth={1.5} />
                  <span className="text-[11px] text-[#A2A3A5] font-mono">{mods.length} modules · {lessonCount(mods)} lessons</span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A2A3A5] font-semibold mb-1">Phase {p.num}</p>
                <h2 className="text-lg font-bold font-display text-[#212121] flex items-center gap-1.5">
                  {p.name}
                  <ArrowRight className="w-4 h-4 text-[#D91222] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" strokeWidth={1.5} />
                </h2>
                <p className="mt-2 text-[13px] text-[#727579] leading-relaxed">{p.blurb}</p>
                <p className="mt-5 pt-4 border-t border-[#EEEEEE] text-[11px] text-[#A2A3A5] leading-relaxed">
                  {mods.slice(0, 3).map((m) => m.title).join('  ·  ')}
                  {mods.length > 3 ? `  ·  +${mods.length - 3} more` : ''}
                </p>
              </Link>
            );
          })}
        </section>

        {/* Footer */}
        <p className="mt-12 text-[11px] text-[#A2A3A5]">Educational only — not financial advice.</p>
      </div>
    </div>
  );
}
