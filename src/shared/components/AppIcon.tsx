import React from 'react';
import { Link } from 'react-router-dom';
import type { PuffxApp } from '../../navigation/apps';

/**
 * A desktop icon: glyph tile + label + status sub-line (mock v1). Click/Enter
 * opens the app (single-click — web convention; hover/focus paints the sage
 * highlight the mock shows as "selected"). Coming-soon apps render as ghosts:
 * dashed tile, not interactive, kept out of the tab order.
 */
export default function AppIcon({ app }: { app: PuffxApp }) {
  const Icon = app.icon;

  const glyph = app.comingSoon ? (
    <span className="w-[58px] h-[58px] rounded-[16px] flex items-center justify-center border border-dashed border-hairline text-faint bg-transparent">
      <Icon className="w-[26px] h-[26px]" strokeWidth={1.5} />
    </span>
  ) : (
    <span
      className="w-[58px] h-[58px] rounded-[16px] flex items-center justify-center os-elev os-elev-hover"
      style={{
        color: app.tint,
        background: `linear-gradient(155deg, ${app.tint}1F 0%, ${app.tint}12 100%)`,
        border: `1px solid ${app.tint}33`,
      }}
    >
      <Icon className="w-[27px] h-[27px]" strokeWidth={1.75} />
    </span>
  );

  const label = (
    <>
      <span className={`text-[11.5px] font-medium text-center leading-tight ${app.comingSoon ? 'text-mute' : 'text-ink'}`}>
        {app.name}
      </span>
      {app.sub && (
        <span className={`text-[10px] text-faint ${app.subMono ? 'font-mono' : ''}`}>{app.sub}</span>
      )}
    </>
  );

  if (app.comingSoon) {
    return (
      <span aria-disabled="true" className="w-[92px] flex flex-col items-center gap-1.5 rounded-lg px-0.5 pt-2 pb-1.5 select-none cursor-not-allowed">
        {glyph}
        {label}
      </span>
    );
  }

  return (
    <Link
      to={app.path}
      className="w-[92px] flex flex-col items-center gap-1.5 rounded-lg px-0.5 pt-2 pb-1.5 hover:bg-sage/20 focus-visible:bg-sage/30 active:scale-[0.97] transition duration-200"
    >
      {glyph}
      {label}
    </Link>
  );
}
