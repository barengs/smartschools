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
  blue: 'bg-[#cfe2ff] text-[#052c65] border-[#9ec5fe]',
  navy: 'bg-[#0d6efd] text-white border-[#0d6efd]',
  emerald: 'bg-[#d1e7dd] text-[#0a3622] border-[#a3cfbb]',
  amber: 'bg-[#fff3cd] text-[#664d03] border-[#ffe69c]',
  rose: 'bg-[#f8d7da] text-[#58151c] border-[#f1aeb5]',
  slate: 'bg-[#e9ecef] text-[#495057] border-[#dee2e6]',
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
      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-0.5 text-xs font-semibold leading-5 ${
        uppercase ? 'uppercase tracking-wide' : ''
      } ${TONE_MAP[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

