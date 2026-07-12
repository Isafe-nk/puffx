import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { APPS } from '../../navigation/apps';
import AppIcon from './AppIcon';
import Widget from './Widget';
import { LEARN_MODULES } from '../../features/learn/learnConfig';
import { useVisited, readCount, firstUnread, lessonPath, ALL_LESSONS, TOTAL_LESSONS } from '../../features/learn/progress';

/**
 * The landing surface (design.md §1, mock v1): app icons on the wallpaper +
 * live widgets. At lg it mirrors the mock's desk layout (icons top-left,
 * widgets top-right, note bottom-left); below lg it reflows to an icon grid
 * with the widgets stacked beneath.
 */
export default function Desktop() {
  const visited = useVisited();
  const read = readCount(visited, ALL_LESSONS.map((l) => l.lessonId));
  const next = firstUnread(visited);
  const nextTitle = next ? next.module.lessons.find((l) => l.id === next.lessonId)?.title : undefined;
  const pct = Math.round((read / TOTAL_LESSONS) * 100);

  // Arrow keys walk the icon list (design.md §1: keyboard-navigable shell).
  const iconsRef = useRef<HTMLDivElement>(null);
  const onIconsKeyDown = (e: React.KeyboardEvent) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
    const links = Array.from(iconsRef.current?.querySelectorAll<HTMLElement>('a') ?? []);
    const idx = links.indexOf(document.activeElement as HTMLElement);
    if (idx < 0 || !links.length) return;
    e.preventDefault();
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    links[(idx + delta + links.length) % links.length].focus();
  };

  // Learn's icon carries live progress as its status line (mock: "12/68").
  const desktopApps = APPS.map((a) =>
    a.id === 'learn' ? { ...a, sub: `${read}/${TOTAL_LESSONS}`, subMono: true } : a
  );

  return (
    <div className="relative h-full overflow-y-auto lg:overflow-hidden p-6 lg:p-0">
      {/* Icons — mock: 2-col grid pinned top-left; mobile: flowing grid */}
      <div
        ref={iconsRef}
        onKeyDown={onIconsKeyDown}
        className="grid grid-cols-3 sm:grid-cols-4 gap-4 justify-items-center lg:justify-items-start lg:absolute lg:top-[26px] lg:left-[26px] lg:grid-cols-2 lg:gap-x-2.5 lg:gap-y-[18px]"
      >
        {desktopApps.map((app) => (
          <AppIcon key={app.id} app={app} />
        ))}
      </div>

      {/* Widgets — mock: pinned top-right; mobile: stacked below the icons */}
      <div className="mt-8 flex flex-col gap-4 lg:mt-0 lg:contents">
        <Widget kicker="Continue learning" className="w-full lg:absolute lg:top-[34px] lg:right-[34px] lg:w-[250px]">
          <div className="text-[21px] font-extrabold text-ink leading-tight">
            {read}
            <small className="text-[12px] font-medium text-faint"> / {TOTAL_LESSONS} lessons</small>
          </div>
          {next && (
            <p className="text-[11.5px] text-mute mt-0.5">
              {read > 0 ? 'Next up' : 'Start with'} · <b className="text-accent font-semibold">{next.lessonId} {nextTitle}</b>
            </p>
          )}
          <div className="h-1 rounded-full bg-hairline-soft mt-2.5 overflow-hidden" role="progressbar" aria-valuenow={read} aria-valuemin={0} aria-valuemax={TOTAL_LESSONS} aria-label="Course progress">
            <i className="block h-full rounded-full bg-sage" style={{ width: `${Math.max(pct, read > 0 ? 2 : 0)}%` }} />
          </div>
          <Link
            to={next ? lessonPath(next.module, next.lessonId) : `/learn/${LEARN_MODULES[0].slug}`}
            className="inline-flex items-center gap-1.5 mt-3 bg-accent hover:bg-accent-hover text-white text-[11.5px] font-semibold rounded-md px-3 py-[7px] active:scale-[0.98] transition duration-200"
          >
            {read > 0 ? 'Resume' : 'Start'}
            <ArrowRight className="w-[13px] h-[13px]" strokeWidth={2} />
          </Link>
        </Widget>

        {/* Static placeholder this phase (brief §C) — wired to a saved plan later */}
        <Widget kicker="Wealth Simulator · saved plan" className="w-full lg:absolute lg:top-[208px] lg:right-[34px] lg:w-[250px]">
          <div className="text-[19px] font-extrabold text-ink font-mono">RM 1.82M</div>
          <div className="flex justify-between text-[11px] text-mute mt-1.5">
            <span>projected at 60</span>
            <span className="text-accent font-semibold">on track</span>
          </div>
        </Widget>
      </div>

      <p className="mt-8 pb-2 text-[10.5px] text-faint lg:mt-0 lg:pb-0 lg:absolute lg:left-[26px] lg:bottom-[22px]">
        Educational only — not financial advice.
      </p>
    </div>
  );
}
