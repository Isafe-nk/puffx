import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Wallet, Book } from 'lucide-react';
import { useApp } from '../../context/OSProvider';
import AppIcon from './AppIcon';
import Widget from './Widget';
import { LEARN_MODULES } from '../../features/learn/learnConfig';
import { useVisited, readCount, firstUnread, lessonPath, ALL_LESSONS, TOTAL_LESSONS } from '../../features/learn/progress';
import glossary from '../../features/glossary/data/glossary.json';

const GLOSSARY_TERMS = (glossary as { terms: { term: string; definition: string }[] }).terms;

// Static sparkline shape for the saved-plan placeholder (mock heights).
const SPARK = [30, 42, 38, 55, 60, 72, 90];

/**
 * The desktop (design.md §1, desktop-APPROVED mock): a three-column desk —
 * installed-app icons down the left rail, a quiet greeting in the centre, and a
 * live widget stack on the right. Reflows to a single scrolling column below lg.
 */
export default function Desktop() {
  const { apps } = useApp();
  const visited = useVisited();

  const read = readCount(visited, ALL_LESSONS.map((l) => l.lessonId));
  const next = firstUnread(visited);
  const nextTitle = next ? next.module.lessons.find((l) => l.id === next.lessonId)?.title : undefined;
  const pct = Math.round((read / TOTAL_LESSONS) * 100);

  // Word of the day — a glossary term chosen by day-of-year (stable within a day).
  const wotd = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0).getTime();
    const doy = Math.floor((now.getTime() - start) / 86_400_000);
    return GLOSSARY_TERMS[doy % GLOSSARY_TERMS.length];
  }, []);

  return (
    <div className="os-desk-layer h-full min-h-0 flex flex-col lg:grid lg:grid-cols-[auto_1fr_auto] overflow-y-auto lg:overflow-hidden">

      {/* LEFT — installed-app rail */}
      <nav
        aria-label="Installed apps"
        className="order-2 lg:order-none flex flex-row flex-wrap justify-center content-start gap-1 px-4 pb-6 lg:flex-col lg:flex-nowrap lg:justify-start lg:py-[22px] lg:px-[18px]"
      >
        {apps.map((app) => (
          <AppIcon key={app.id} app={app} />
        ))}
      </nav>

      {/* CENTER — quiet greeting */}
      <div className="order-1 lg:order-none flex flex-col px-6 pt-12 lg:px-2 lg:pt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-3">Your money, one place</p>
        <h1 className="text-[33px] font-extrabold tracking-[-0.025em] leading-[1.05] text-ink">Own your numbers.</h1>
        <p className="mt-2 text-[14px] text-mute leading-relaxed max-w-[380px]">
          Nothing here is trying to sell you anything.
        </p>
      </div>

      {/* RIGHT — widget stack */}
      <aside className="order-3 lg:order-none w-full lg:w-[314px] flex flex-col gap-3.5 px-4 pb-6 lg:py-[26px] lg:px-[22px] lg:overflow-y-auto">

        {/* Continue learning — wired to progress.ts */}
        <Widget kicker="Continue learning" icon={BookOpen}>
          <div className="flex items-baseline justify-between">
            <div className="text-[29px] font-extrabold tracking-[-0.02em] leading-none text-ink">
              {pct}<small className="text-[13px] font-semibold text-faint">%</small>
            </div>
            <span className="text-[11px] font-semibold text-accent bg-sage-tint rounded-full px-2.5 py-[3px]">
              {read} / {TOTAL_LESSONS}
            </span>
          </div>
          {next && (
            <p className="text-[12px] text-mute mt-2.5">
              {read > 0 ? 'Next' : 'Start'} · <b className="text-accent font-semibold">{next.lessonId} {nextTitle}</b>
            </p>
          )}
          <div className="h-1.5 rounded-full bg-hairline-soft mt-3 overflow-hidden" role="progressbar" aria-valuenow={read} aria-valuemin={0} aria-valuemax={TOTAL_LESSONS} aria-label="Course progress">
            <i className="block h-full rounded-full os-track-fill" style={{ width: `${Math.max(pct, read > 0 ? 3 : 0)}%` }} />
          </div>
          <Link
            to={next ? lessonPath(next.module, next.lessonId) : `/learn/${LEARN_MODULES[0].slug}`}
            className="inline-flex items-center gap-1.5 mt-3.5 bg-accent hover:bg-accent-hover text-white text-[12px] font-semibold px-3.5 py-2 rounded-[9px] active:scale-[0.98] transition duration-200"
          >
            {read > 0 ? 'Resume' : 'Start'}
            <ArrowRight className="w-[13px] h-[13px]" strokeWidth={2.2} />
          </Link>
        </Widget>

        {/* Saved plan — placeholder until a plan is saved (handback item 2) */}
        <Widget kicker="Saved plan" icon={Wallet}>
          <div className="flex items-baseline justify-between">
            <div className="text-[29px] font-extrabold tracking-[-0.02em] leading-none text-ink font-mono">RM 1.82M</div>
            <span className="text-[11px] font-semibold text-accent bg-sage-tint rounded-full px-2.5 py-[3px]">on track</span>
          </div>
          <p className="text-[12px] text-mute mt-2.5">projected net worth at 60</p>
          <div className="flex items-end gap-[3px] h-8 mt-3" aria-hidden="true">
            {SPARK.map((h, i) => (
              <i
                key={i}
                className={`flex-1 rounded-sm ${i === SPARK.length - 1 ? 'bg-accent' : 'bg-sage-soft'}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </Widget>

        {/* Word of the day — from the glossary */}
        <Widget kicker="Word of the day" icon={Book}>
          <div className="text-[19px] font-extrabold tracking-[-0.02em] leading-tight text-ink">{wotd.term}</div>
          <p className="text-[11px] text-faint mt-1.5 leading-relaxed line-clamp-2">{wotd.definition}</p>
          <Link to="/glossary" className="inline-block text-[11px] font-semibold text-accent hover:text-accent-hover mt-2.5">
            Open glossary →
          </Link>
        </Widget>
      </aside>

      <p className="absolute left-[22px] bottom-3.5 text-[10.5px] text-faint">Not financial advice.</p>
    </div>
  );
}
