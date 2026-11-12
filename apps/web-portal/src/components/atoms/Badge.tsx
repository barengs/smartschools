import React from 'react';

export type BadgeTone = 'blue' | 'navy' | 'emerald' | 'amber' | 'rose' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  icon?: React.ReactNode;
  uppercase?: boolean;
  className?: string;
}

const TONE_MAP: Record<BadgeTone, string> = {
  blue: 'bg-blue-50 text-blue-800 border-blue-200',
  navy: 'bg-[#0f2b6b] text-white border-[#0f2b6b]',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function Badge({
  children,
  tone = 'blue',
  icon,
  uppercase = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold leading-5 ${
        uppercase ? 'uppercase tracking-wider' : ''
      } ${TONE_MAP[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

