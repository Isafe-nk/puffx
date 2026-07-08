import React, { useEffect, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTipProps {
  children: React.ReactNode;
  /** Accessible name for the trigger button. */
  label?: string;
  /** Which edge of the trigger the popover hangs from. */
  align?: 'left' | 'right' | 'center';
}

/**
 * Click/tap-toggled help popover. Hover-only tooltips are unreachable on touch
 * devices and by keyboard, so the trigger is a real button: tap or Enter opens,
 * Escape or clicking anywhere else closes.
 */
export default function HelpTip({ children, label = 'More info', align = 'right' }: HelpTipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pos = align === 'right' ? 'right-0' : align === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2';

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        className={`cursor-help transition-colors ${open ? 'text-[#44474D]' : 'text-[#A2A3A5] hover:text-[#44474D]'}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span
          role="note"
          className={`absolute ${pos} bottom-full mb-2 w-64 p-3 bg-white border border-[#E6E6E6] text-[#44474D] text-[10.5px] rounded-xl shadow-lg z-50 leading-relaxed font-normal normal-case text-left tracking-normal`}
        >
          {children}
        </span>
      )}
    </span>
  );
}
