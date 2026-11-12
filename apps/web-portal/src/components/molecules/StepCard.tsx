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
    <Card padding="md" className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#163b8c] text-xs font-extrabold text-white tabular-nums">
            {stepNumber}
          </span>
          {badgeText && <Badge tone={badgeTone}>{badgeText}</Badge>}
        </div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{description}</p>
      </div>

      {(metaTop || metaBottom) && (
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-[11px]">
          {metaTop && <div className="font-bold text-slate-800">{metaTop}</div>}
          {metaBottom && <div className="text-slate-500 mt-0.5">{metaBottom}</div>}
        </div>
      )}
    </Card>
  );
}

