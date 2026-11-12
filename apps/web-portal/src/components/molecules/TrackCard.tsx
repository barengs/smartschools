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
  highlightBadge = 'PALING DIMINATI',
  onSelect,
}: TrackCardProps) {
  return (
    <Card
      variant={highlighted ? 'highlight' : 'default'}
      padding="md"
      className="relative flex flex-col justify-between"
    >
      {highlighted && (
        <div className="absolute -top-3 right-5">
          <Badge tone="navy" uppercase>
            {highlightBadge}
          </Badge>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge tone={highlighted ? 'blue' : 'slate'}>{quotaLabel}</Badge>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[#163b8c]">
            {icon}
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{description}</p>

        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
          {specs.map((spec) => (
            <div key={spec.label} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">{spec.label}</span>
              <span className="font-bold text-slate-900 text-right">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant={highlighted ? 'primary' : 'outline'}
        size="sm"
        fullWidth
        className="mt-5"
        onClick={onSelect}
      >
        {ctaLabel}
      </Button>
    </Card>
  );
}

