import { GraduationCap } from 'lucide-react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  subtitle?: string;
  compact?: boolean;
}

export function BrandLogo({
  variant = 'dark',
  subtitle = 'INTEGRATED ECOSYSTEM',
  compact = false,
}: BrandLogoProps) {
  const isLight = variant === 'light';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`flex items-center justify-center rounded-xl border ${
          compact ? 'h-9 w-9' : 'h-10 w-10'
        } ${
          isLight
            ? 'bg-white/15 border-white/25 text-white'
            : 'bg-gradient-to-br from-[#0f2b6b] to-[#1d4ed8] border-blue-900/20 text-white shadow-sm'
        }`}
      >
        <GraduationCap className={compact ? 'h-5 w-5' : 'h-5.5 w-5.5'} />
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={`text-base font-extrabold tracking-tight ${
            isLight ? 'text-white' : 'text-slate-900'
          }`}
        >
          SmartSchool
        </span>
        {subtitle && (
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
              isLight ? 'text-blue-200' : 'text-slate-500'
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

