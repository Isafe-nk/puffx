import React from 'react';

/**
 * A desktop widget (desktop-APPROVED mock, warm-Win95): a raised double-bevel
 * panel with squared 3px corners, a quiet uppercase label header (hairline
 * underline — not a solid bar), and a content area the caller fills.
 */
export default function Widget({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`os-widget rounded-[3px] overflow-hidden ${className}`}>
      <div className="px-[13px] pt-2 pb-[7px] text-[10px] font-bold uppercase tracking-[0.14em] text-mute border-b border-hairline">
        {title}
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}
