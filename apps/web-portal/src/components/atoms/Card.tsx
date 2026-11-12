import React from 'react';

type CardVariant = 'default' | 'navy' | 'tinted' | 'highlight';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const VARIANT_MAP: Record<CardVariant, string> = {
  default: 'bg-white border border-slate-200/90 shadow-xs',
  navy: 'bg-gradient-to-br from-[#0f2b6b] via-[#13347d] to-[#163b8c] text-white border border-blue-900/40 shadow-lg shadow-blue-950/15',
  tinted: 'bg-blue-50/60 border border-blue-100',
  highlight: 'bg-white border-2 border-[#163b8c] shadow-md shadow-blue-900/10',
};

const PAD_MAP = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
}: CardProps) {
  return (
    <div className={`rounded-2xl ${VARIANT_MAP[variant]} ${PAD_MAP[padding]} ${className}`}>
      {children}
    </div>
  );
}

