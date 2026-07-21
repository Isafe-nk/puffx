import React from 'react';
import type { PuffxApp } from '../../navigation/apps';

/**
 * A rail app icon (desktop-APPROVED mock): 112px cell, 58px glyph, 2px gap,
 * 13px/500 label. Real PNG apps render the bare image — no tile bg/border/
 * shadow/rounding. Apps without a PNG fall back to a tinted gradient glyph;
 * coming-soon apps show a dashed lucide glyph and aren't interactive.
 *
 * Hover paints ONLY the label with a solid white chip — the icon and cell do
 * not move, there's no cell box, and there's no persistent selection.
 * Single-click opens (it's a link).
 */
export default function AppIcon({ app, onOpen }: { app: PuffxApp; onOpen: () => void }) {
  const Icon = app.icon;

  let glyph: React.ReactNode;
  if (app.iconImg) {
    glyph = (
      <span className="w-[58px] h-[58px] flex items-center justify-center">
        <img src={app.iconImg} alt="" className="w-full h-full object-cover block" />
      </span>
    );
  } else if (app.comingSoon) {
    glyph = (
      <span className="w-[58px] h-[58px] rounded-[16px] flex items-center justify-center border-[1.5px] border-dashed border-hairline text-faint">
        <Icon className="w-[26px] h-[26px]" strokeWidth={1.9} />
      </span>
    );
  } else {
    glyph = (
      <span
        className="w-[58px] h-[58px] rounded-[16px] flex items-center justify-center os-glyph-fallback text-white"
        style={{ ['--tint' as string]: app.tint }}
      >
        <Icon className="w-[26px] h-[26px] relative z-[1]" strokeWidth={1.9} />
      </span>
    );
  }

  // PostHog AppLink pattern: an INLINE label with box-decoration-clone paints
  // one white chip per wrapped line (two boxes for a two-line name). The outer
  // span is the flex item (block, centres the text + allows wrapping); the inner
  // span stays inline so the background follows each line. The chip sits at 0.75
  // opacity at rest and sharpens to 1.0 on hover.
  const label = (
    <span className="w-full text-center leading-[1.3]">
      <span className="inline box-decoration-clone text-ink text-[13px] font-medium px-[5px] py-px rounded-[4px] bg-transparent group-hover:bg-white group-hover:shadow-sm transition-colors duration-100">
        {app.name}
      </span>
    </span>
  );

  if (app.comingSoon) {
    return (
      <span aria-disabled="true" className="group w-28 flex flex-col items-center gap-0.5 pt-2.5 px-1.5 pb-2 select-none cursor-default">
        {glyph}
        <span className="w-full text-center leading-[1.3]">
          <span className="inline box-decoration-clone text-mute text-[13px] font-medium px-[5px] py-px">{app.name}</span>
        </span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-28 flex flex-col items-center gap-0.5 pt-2.5 px-1.5 pb-2 rounded-[14px] active:scale-[0.97] transition-transform duration-150"
    >
      {glyph}
      {label}
    </button>
  );
}
