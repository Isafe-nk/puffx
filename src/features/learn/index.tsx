import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ListOrdered, Scale, MapPin, Landmark, TrendingUp, ArrowRight, type LucideIcon } from 'lucide-react';
import { PHASES, LEARN_MODULES, modulesInPhase, lessonCount } from './learnConfig';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import { useVisited, readCount, firstUnread, lessonPath, ALL_LESSONS, TOTAL_LESSONS } from './progress';

const FIRST_MODULE = LEARN_MODULES[0];

// Approved copy per track (puffx-learning-hub-landing.html).
const TRACK: Record<string, { icon: LucideIcon; tile: string; desc: string }> = {
  'personal-finance': {
    icon: Landmark,
    tile: 'bg-accent',
    desc: 'Know your money, budget, debt, and protection — the foundations.',
  },
  investment: {
    icon: TrendingUp,
    tile: 'bg-info',
    desc: 'Foundations, Malaysian vehicles, the markets, and long-term planning.',
  },
};

const PRINCIPLES = [
  { icon: ListOrdered, title: 'Go in order', desc: 'Each lesson builds on the one before — start at the top.' },
  { icon: Scale, title: 'Independent & neutral', desc: 'We explain the options and never sell a product.' },
  { icon: MapPin, title: 'Built for Malaysia', desc: 'EPF, LHDN, ASB and the local vehicles, in plain English.' },
];

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">
    <span className="w-[22px] h-[1.5px] bg-accent rounded" />
    {children}
  </div>
);

export default function Learn() {
  usePageTitle('Learning Hub');
  const visited = useVisited();
  const read = readCount(visited, ALL_LESSONS.map((l) => l.lessonId));
  const next = firstUnread(visited) ?? { module: FIRST_MODULE, lessonId: FIRST_MODULE.lessons[0].id };
  const nextTitle = next.module.lessons.find((l) => l.id === next.lessonId)?.title;
  const pct = Math.round((read / TOTAL_LESSONS) * 100);
  const started = read > 0;

  return (
    <div className="max-w-[860px] mx-auto px-6 lg:px-11 pt-11 pb-16">
      <Eyebrow>Free · Self-paced · Built for Malaysia</Eyebrow>
      <h1 className="mt-3 text-[31px] font-extrabold tracking-[-0.025em] leading-[1.05] text-ink">Learning Hub</h1>
      <p className="mt-2 text-[14px] text-mute leading-relaxed max-w-[58ch]">
        Money the way school never taught you — from your first payslip to building real wealth.
      </p>

      {/* Continue card */}
      <div className="os-card mt-7 flex flex-col sm:flex-row sm:items-center gap-5 rounded-lg bg-surface p-[22px]">
        <div className="text-[30px] font-extrabold font-mono leading-none text-ink">
          {pct}<small className="text-[13px] text-faint">%</small>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint mb-1.5">
            {started ? 'Continue where you left off' : 'Start learning'}
          </div>
          <div className="text-[14px] font-semibold text-ink">
            {next.lessonId} · {nextTitle} <span className="text-mute font-normal">— {next.module.title}</span>
          </div>
        </div>
        <Link
          to={lessonPath(next.module, next.lessonId)}
          className="inline-flex items-center gap-2 self-start bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold px-4 py-2.5 rounded-md active:scale-[0.98] transition duration-200"
        >
          {started ? 'Resume' : 'Start'}
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
        </Link>
      </div>

      {/* Two tracks */}
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-faint mt-9 mb-3.5">Two tracks</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PHASES.map((p) => {
          const mods = modulesInPhase(p.name);
          const total = lessonCount(mods);
          const done = readCount(visited, mods.flatMap((m) => m.lessons.map((l) => l.id)));
          const t = TRACK[p.slug] ?? TRACK['personal-finance'];
          const Icon = t.icon;
          return (
            <Link
              key={p.slug}
              to={`/learn/phase/${p.slug}`}
              className="os-card group rounded-lg bg-surface p-[22px] hover:border-accent transition-colors block"
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className={`w-[38px] h-[38px] rounded-[9px] flex items-center justify-center text-white ${t.tile}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.7} />
                </span>
                <span className="text-[11px] text-faint font-mono">{mods.length} modules · {total} lessons</span>
              </div>
              <h3 className="text-[16px] font-extrabold tracking-[-0.01em] text-ink">{p.name}</h3>
              <p className="mt-1 text-[12px] text-mute leading-relaxed">{t.desc}</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-mute">
                <span className="font-mono">{done}/{total}</span>
                <span className="flex-1 h-[5px] rounded-full bg-hairline-soft overflow-hidden">
                  <i className="block h-full rounded-full bg-accent" style={{ width: `${(done / total) * 100}%` }} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-6 border-t border-hairline">
        {PRINCIPLES.map(({ icon: Icon, title, desc }) => (
          <div key={title}>
            <Icon className="w-[18px] h-[18px] text-accent mb-2" strokeWidth={1.6} />
            <h4 className="text-[13px] font-bold text-ink mb-0.5">{title}</h4>
            <p className="text-[12px] text-mute leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-9 text-[11px] text-faint">Educational only — not financial advice.</p>
    </div>
  );
}
