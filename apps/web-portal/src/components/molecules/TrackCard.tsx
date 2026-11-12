import React from 'react';
import { Badge, Button, Card } from '../atoms';

interface TrackCardProps {
  quotaLabel: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  specs: Array<{ label: string; value: string }>;
  ctaLabel: string;
  highlighted?: boolean;
  highlightBadge?: string;
  remainingText?: string;
  onSelect: () => void;
}

export function TrackCard({
  quotaLabel,
  title,
  description,
  icon,
  specs,
  ctaLabel,
  highlighted = false,
  highlightBadge = 'Populer',
  remainingText,
  onSelect,
}: TrackCardProps) {
  return (
    <Card
      variant={highlighted ? 'highlight' : 'default'}
      padding="none"
      className="flex flex-col justify-between overflow-hidden h-full"
    >
      <div
        className={`flex items-center justify-between gap-2 border-b px-5 py-3 ${
          highlighted
            ? 'bg-[#0d6efd] text-white border-[#0d6efd]'
            : 'bg-[#f8f9fa] text-[#212529] border-[#dee2e6]'
        }`}
      >
        <span className="text-sm font-semibold">{quotaLabel}</span>
        <div className="flex items-center gap-2">
          {highlighted && (
            <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-[#0d6efd]">
              {highlightBadge}
            </span>
          )}
          <span className={highlighted ? 'text-white' : 'text-[#0d6efd]'}>{icon}</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#212529]">{title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#495057]">{description}</p>
        </div>

        <div className="mt-4">
          {remainingText && (
            <div className="mb-3">
              <Badge tone="emerald">{remainingText}</Badge>
            </div>
          )}
          <ul className="divide-y divide-[#dee2e6] rounded-md border border-[#dee2e6] text-sm">
            {specs.map((spec) => (
              <li key={spec.label} className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="text-[#6c757d]">{spec.label}</span>
                <span className="font-semibold text-[#212529] text-right">{spec.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#dee2e6] bg-[#f8f9fa] px-5 py-3">
        <Button
          variant={highlighted ? 'primary' : 'outline'}
          size="md"
          fullWidth
          onClick={onSelect}
        >
          {ctaLabel}
        </Button>
      </div>
    </Card>
  );
}
