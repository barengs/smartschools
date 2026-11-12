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
        className={`flex items-center justify-center rounded-md border ${
          compact ? 'h-9 w-9' : 'h-10 w-10'
        } ${
          isLight
            ? 'bg-white/15 border-white/25 text-white'
            : 'bg-[#0d6efd] border-[#0a58ca] text-white'
        }`}
      >
        <GraduationCap className={compact ? 'h-5 w-5' : 'h-5.5 w-5.5'} />
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={`text-lg font-bold tracking-tight ${
            isLight ? 'text-white' : 'text-[#212529]'
          }`}
        >
          SmartSchool
        </span>
        {subtitle && (
          <span
            className={`text-[11px] font-medium ${
              isLight ? 'text-blue-100' : 'text-[#6c757d]'
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

