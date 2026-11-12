import { Badge, BadgeTone, Card } from '../atoms';

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  badgeText?: string;
  badgeTone?: BadgeTone;
  metaTop?: string;
  metaBottom?: string;
}

export function StepCard({
  stepNumber,
  title,
  description,
  badgeText,
  badgeTone = 'blue',
  metaTop,
  metaBottom,
}: StepCardProps) {
  return (
    <Card padding="none" className="flex flex-col justify-between h-full overflow-hidden">
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#0d6efd] text-sm font-bold text-white tabular-nums">
            {stepNumber}
          </span>
          {badgeText && <Badge tone={badgeTone}>{badgeText}</Badge>}
        </div>
        <h3 className="text-base font-bold text-[#212529]">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#495057]">{description}</p>
      </div>

      {(metaTop || metaBottom) && (
        <div className="border-t border-[#dee2e6] bg-[#f8f9fa] px-5 py-3 text-xs">
          {metaTop && <div className="font-semibold text-[#212529]">{metaTop}</div>}
          {metaBottom && <div className="text-[#6c757d] mt-0.5">{metaBottom}</div>}
        </div>
      )}
    </Card>
  );
}
