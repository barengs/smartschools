import React from 'react';

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  rightSlot?: React.ReactNode;
}

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = 'left',
  rightSlot,
}: SectionHeadingProps) {
  if (align === 'center') {
    return (
      <div className="mx-auto max-w-2xl text-center">
        {kicker && (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#163b8c] mb-2">
            {kicker}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle && <p className="mt-2.5 text-sm sm:text-base text-slate-600">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div className="max-w-2xl">
        {kicker && (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#163b8c] mb-1.5">
            {kicker}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}

