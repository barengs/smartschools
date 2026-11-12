import React from 'react';
import { Card } from '../atoms';

interface PillarCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  footerLabel: string;
  footerIcon?: React.ReactNode;
}

export function PillarCard({
  icon,
  title,
  description,
  footerLabel,
  footerIcon,
}: PillarCardProps) {
  return (
    <Card
      padding="md"
      className="flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all duration-200"
    >
      <div>
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#163b8c] border border-blue-100">
          {icon}
        </div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{description}</p>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-bold text-[#163b8c]">
        <span>{footerLabel}</span>
        {footerIcon}
      </div>
    </Card>
  );
}

