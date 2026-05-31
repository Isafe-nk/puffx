import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
}

export default function Card({ children, glass = true, className = "", ...props }: CardProps) {
  return (
    <div 
      className={`${glass ? 'glass-card' : 'bg-white'} rounded-3xl p-5 lg:p-6 shadow-sm relative border border-[#E6E6E6] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
