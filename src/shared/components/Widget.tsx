import React from 'react';

/**
 * A live desktop card (mock v1): ivory surface, hairline border, kicker with
 * the short accent dash. Positioning (absolute on the desk at lg, stacked on
 * mobile) belongs to the Desktop layout, not here.
 */
export default function Widget({
  kicker,
  children,
  className = '',
}: {
  kicker: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface border border-hairline rounded-[12px] px-[18px] py-4 ${className}`}>
      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint mb-2">
        <span className="w-4 h-px bg-accent" aria-hidden="true" />
        {kicker}
      </p>
      {children}
    </div>
  );
}
