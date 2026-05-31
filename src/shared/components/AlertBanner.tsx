import React from 'react';

export type AlertType = 'info' | 'warning' | 'error' | 'success';

interface AlertBannerProps {
  type: AlertType;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const styles = {
  info: 'bg-[#F0F7FF] border-[#0066FF]/30 text-[#0066FF]',
  warning: 'bg-[#FFF8E6] border-[#FFB300]/30 text-[#B27D00]',
  error: 'bg-[#FFF0F2] border-[#D91222]/30 text-[#D91222]',
  success: 'bg-[#F0FDF4] border-[#0EB35B]/30 text-[#0EB35B]'
};

export default function AlertBanner({ type, title, children, icon, className = "" }: AlertBannerProps) {
  return (
    <div className={`border rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden ${styles[type]} ${className}`}>
      <div className="flex gap-4 relative z-10">
        {icon && (
          <div className="shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1 text-[#44474D]">
          {title && <h3 className="text-sm font-bold mb-2 uppercase tracking-wide text-inherit">{title}</h3>}
          <div className="text-sm leading-relaxed text-[#44474D]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
