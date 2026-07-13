import React from 'react';
import HelpTip from './HelpTip';

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
  inputWidth?: string | number;
  labelWidth?: string | number;
  layout?: 'stacked' | 'inline';
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
  inputWidth = "w-24",
  labelWidth = "w-24",
  layout = "stacked"
}: SliderInputProps) {
  const displayValue = format ? format(value) : (valueText || value);

  // Helper to parse dynamic width props into style objects and class names
  const parseWidth = (width: string | number) => {
    if (typeof width === 'number') {
      return { style: { width: `${width}px` }, className: "" };
    }
    if (width.includes('px') || width.includes('rem') || width.includes('%') || width.includes('em')) {
      return { style: { width }, className: "" };
    }
    return { style: {}, className: width };
  };

  const labelParsed = parseWidth(labelWidth);
  const inputParsed = parseWidth(inputWidth);

  if (layout === "inline") {
    return (
      <div className={`flex items-center gap-3 py-1 ${className}`}>
        {/* Label Column */}
        <div 
          style={labelParsed.style} 
          className={`${labelParsed.className} shrink-0 flex flex-col justify-center`}
        >
          <span className="text-xs font-semibold text-[#75806F] py-0.5 select-none inline-flex items-center gap-1">
            {label}
            {tooltip && <HelpTip align="left" label={`About ${label}`}>{tooltip}</HelpTip>}
          </span>
          {subLabel && (
            <span className="text-[10px] font-mono text-[#9AA394] mt-0.5 leading-none">
              {subLabel}
            </span>
          )}
        </div>

        {/* Slider Column */}
        <div className="flex-1 flex items-center min-w-0">
          <input
            type="range"
            aria-label={label}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#DCE0D2] rounded-lg appearance-none cursor-pointer accent-[#3E7355]"
          />
        </div>

        {/* Value Box Column */}
        <div 
          style={inputParsed.style} 
          className={`${inputParsed.className} shrink-0`}
        >
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
              className="w-full text-right bg-white border border-[#DCE0D2] focus:outline-none focus:border-[#3E7355] focus:ring-1 focus:ring-[#3E7355]/30 text-xs font-semibold px-2.5 py-1 rounded-xl text-[#243129] font-mono"
            />
          ) : (
            <div className="w-full text-right text-xs font-semibold text-[#3E7355] font-mono py-1">
              {displayValue}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-[#75806F] py-0.5 inline-flex items-center gap-1">
          {label}
          {tooltip && <HelpTip align="left" label={`About ${label}`}>{tooltip}</HelpTip>}
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
            className={`${inputParsed.className} text-right bg-white border border-[#DCE0D2] focus:outline-none focus:border-[#3E7355] focus:ring-1 focus:ring-[#3E7355]/30 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-[#243129] font-mono`}
            style={inputParsed.style}
          />
        ) : (
          <span className="text-xs font-semibold text-[#3E7355] font-mono">
            {displayValue}
          </span>
        )}
      </div>
      
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-[#DCE0D2] rounded-lg appearance-none cursor-pointer accent-[#3E7355]"
      />
      
      <div className="flex justify-between text-[10px] text-[#9AA394] font-mono mt-0.5">
        <span>{subLabel || leftLabel}</span>
        {centerLabel && <span>{centerLabel}</span>}
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
