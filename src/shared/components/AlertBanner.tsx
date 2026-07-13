import React from 'react';

export type AlertType = 'info' | 'warning' | 'error' | 'success';

interface AlertBannerProps {
  type: AlertType;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

// Soft Dragon tints — semantic, not brand. Error/warning keep their own hue
// (red survives only here, per design.md §3); success borrows the moss accent.
const styles = {
  info: 'bg-[#EBF0F1] border-[#4E7A96]/30 text-[#4E7A96]',
  warning: 'bg-[#FBF2DF] border-[#D99A2B]/40 text-[#9A6E1F]',
  error: 'bg-[#FAEBE9] border-[#C4453C]/30 text-[#C4453C]',
  success: 'bg-[#EDF3EC] border-[#3E7355]/30 text-[#3E7355]'
};

export default function AlertBanner({ type, title, children, icon, className = "" }: AlertBannerProps) {
  return (
    <div className={`border rounded-lg p-5 md:p-6 relative overflow-hidden ${styles[type]} ${className}`}>
      <div className="flex gap-4 relative z-10">
        {icon && (
          <div className="shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1 text-[#4A544C]">
          {title && <h3 className="text-sm font-bold mb-2 uppercase tracking-wide text-inherit">{title}</h3>}
          <div className="text-sm leading-relaxed text-[#4A544C]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
