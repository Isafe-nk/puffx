import React from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * A live desktop widget (desktop-APPROVED mock): frosted ivory card, soft depth,
 * an uppercase kicker led by a small accent lucide icon. Body is the caller's.
 */
export default function Widget({
  kicker,
  icon: Icon,
  children,
  className = '',
}: {
  kicker: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface/85 backdrop-blur-md border border-hairline/90 rounded-[18px] px-5 py-[18px] os-elev ${className}`}
    >
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-faint mb-3.5">
        <Icon className="w-[13px] h-[13px] text-accent" strokeWidth={2} />
        {kicker}
      </p>
      {children}
    </div>
  );
}
