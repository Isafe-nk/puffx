import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
  className?: string;
}

export default function Card({ children, glass = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`${glass ? 'glass-card' : 'bg-surface'} rounded-lg p-5 lg:p-6 relative border border-[#DCE0D2] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
