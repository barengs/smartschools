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
      padding="none"
      className="flex flex-col justify-between overflow-hidden h-full hover:border-[#86b7fe] transition-colors"
    >
      <div className="p-5 flex-1">
        <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-md bg-[#cfe2ff] text-[#084298]">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-[#212529]">{title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-[#495057]">{description}</p>
      </div>
      <div className="flex items-center justify-between border-t border-[#dee2e6] bg-[#f8f9fa] px-5 py-3 text-sm font-medium text-[#0a58ca]">
        <span>{footerLabel}</span>
        {footerIcon}
      </div>
    </Card>
  );
}
