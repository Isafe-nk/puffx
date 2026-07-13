import React from 'react';

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  valueColor?: string;
  className?: string;
}

export default function KpiCard({
  label,
  value,
  subtitle,
  valueColor = "text-[#243129]",
  className = ""
}: KpiCardProps) {
  return (
    <div className={`bg-white border border-[#DCE0D2] rounded-xl px-5 py-4 min-w-[180px] text-center shadow-sm relative z-10 flex flex-col justify-center ${className}`}>
      <span className="text-[10px] uppercase font-bold text-[#9AA394] tracking-wider">{label}</span>
      <span className={`text-2xl md:text-3xl font-black font-mono mt-1 ${valueColor}`}>
        {value}
      </span>
      {subtitle && (
        <span className="text-[10px] text-[#75806F] mt-0.5 leading-none">{subtitle}</span>
      )}
    </div>
  );
}
