interface ProgressMeterProps {
  label: string;
  rightTop: string;
  percentage: number;
  leftBottom?: string;
  rightBottom?: string;
  tone?: 'blue' | 'teal' | 'emerald' | 'amber';
}

const BAR_COLORS = {
  blue: 'bg-[#163b8c]',
  teal: 'bg-teal-600',
  emerald: 'bg-emerald-600',
  amber: 'bg-amber-500',
};

export function ProgressMeter({
  label,
  rightTop,
  percentage,
  leftBottom,
  rightBottom,
  tone = 'blue',
}: ProgressMeterProps) {
  const clamped = Math.max(0, Math.min(100, percentage));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-800">{label}</span>
        <span className="font-extrabold text-slate-900 tabular-nums">{rightTop}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-300 ${BAR_COLORS[tone]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {(leftBottom || rightBottom) && (
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>{leftBottom}</span>
          <span className="font-semibold text-slate-600">{rightBottom}</span>
        </div>
      )}
    </div>
  );
}

