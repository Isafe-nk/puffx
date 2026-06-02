import React from 'react';

interface SliderInputProps {
  label: string;
  tooltip?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  leftLabel?: React.ReactNode;
  rightLabel?: React.ReactNode;
  centerLabel?: React.ReactNode;
  editable?: boolean;
  valueText?: string;
  className?: string;
  format?: (value: number) => string;
  subLabel?: string;
  inputWidth?: string;
}

export default function SliderInput({
  label,
  tooltip,
  value,
  onChange,
  min,
  max,
  step = 1,
  leftLabel,
  rightLabel,
  centerLabel,
  editable = true,
  valueText,
  className = "",
  format,
  subLabel,
  inputWidth = "w-24"
}: SliderInputProps) {
  const displayValue = format ? format(value) : (valueText || value);
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-[#727579] border-b border-dashed border-[#D0D1D2] hover:border-[#A2A3A5] cursor-help transition-all relative group py-0.5">
          {label}
          {tooltip && (
            <span className="absolute left-0 bottom-full mb-2 w-56 p-2.5 bg-white border border-[#E6E6E6] text-[#44474D] text-[10px] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 leading-relaxed font-normal normal-case text-left">
              {tooltip}
              <span className="absolute top-full left-4 border-4 border-transparent border-t-white"></span>
            </span>
          )}
        </span>
        
        {editable ? (
          <input
            type="text"
            value={displayValue}
            onChange={(e) => {
              const numericValue = parseInt(e.target.value.replace(/[^0-9.-]+/g,""));
              if (!isNaN(numericValue)) {
                onChange(Math.max(0, numericValue));
              }
            }}
            className={`${inputWidth} text-right bg-white border border-[#E6E6E6] focus:outline-none focus:border-[#D91222] focus:ring-1 focus:ring-[#D91222]/30 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-[#212121] font-mono`}
          />
        ) : (
          <span className="text-xs font-semibold text-[#D91222] font-mono">
            {displayValue}
          </span>
        )}
      </div>
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-[#E8E8E9] rounded-lg appearance-none cursor-pointer accent-[#D91222]"
      />
      
      <div className="flex justify-between text-[10px] text-[#A2A3A5] font-mono mt-0.5">
        <span>{subLabel || leftLabel}</span>
        {centerLabel && <span>{centerLabel}</span>}
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
