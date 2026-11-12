import React from 'react';
import { Card } from '../atoms';

interface StatCardProps {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'navy' | 'tinted';
  className?: string;
}

export function StatCard({
  value,
  label,
  sublabel,
  icon,
  variant = 'default',
  className = '',
}: StatCardProps) {
  const isNavy = variant === 'navy';

  return (
    <Card variant={variant} padding="sm" className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[11px] font-semibold ${
            isNavy ? 'text-blue-200' : 'text-slate-500'
          }`}
        >
          {label}
        </span>
        {icon && (
          <span className={isNavy ? 'text-blue-200' : 'text-[#163b8c]'}>{icon}</span>
        )}
      </div>
      <div
        className={`mt-1.5 text-2xl font-extrabold tracking-tight tabular-nums ${
          isNavy ? 'text-white' : 'text-slate-900'
        }`}
      >
        {value}
      </div>
      {sublabel && (
        <div
          className={`mt-1 text-[11px] font-medium ${
            isNavy ? 'text-blue-200' : 'text-slate-500'
          }`}
        >
          {sublabel}
        </div>
      )}
    </Card>
  );
}

