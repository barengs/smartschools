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
      <div className="mx-auto max-w-3xl text-center">
        {kicker && (
          <p className="text-sm font-semibold text-[#0d6efd] mb-1">
            {kicker}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#212529]">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-base text-[#6c757d]">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#dee2e6] pb-4">
      <div className="max-w-3xl">
        {kicker && (
          <p className="text-sm font-semibold text-[#0d6efd] mb-1">
            {kicker}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#212529]">
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 text-base text-[#6c757d]">{subtitle}</p>}
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}

