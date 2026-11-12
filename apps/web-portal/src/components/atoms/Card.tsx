import React from 'react';

type CardVariant = 'default' | 'navy' | 'tinted' | 'highlight';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const VARIANT_MAP: Record<CardVariant, string> = {
  default: 'bg-white border border-[#dee2e6] shadow-2xs',
  navy: 'bg-[#0a58ca] text-white border border-[#084298] shadow-sm',
  tinted: 'bg-[#cfe2ff]/35 border border-[#b6d4fe]',
  highlight: 'bg-white border-2 border-[#0d6efd] shadow-sm',
};

const PAD_MAP = {
  none: '',
  sm: 'p-3.5 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
}: CardProps) {
  return (
    <div className={`min-w-0 rounded ${VARIANT_MAP[variant]} ${PAD_MAP[padding]} ${className}`}>
      {children}
    </div>
  );
}

