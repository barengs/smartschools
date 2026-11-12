import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

type AlertTone = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const TONE_STYLES: Record<AlertTone, { wrap: string; icon: React.ReactNode }> = {
  info: {
    wrap: 'bg-[#cfe2ff] border-[#9ec5fe] text-[#052c65]',
    icon: <Info className="h-5 w-5 text-[#084298] shrink-0 mt-0.5" />,
  },
  success: {
    wrap: 'bg-[#d1e7dd] border-[#a3cfbb] text-[#0a3622]',
    icon: <CheckCircle2 className="h-5 w-5 text-[#146c43] shrink-0 mt-0.5" />,
  },
  warning: {
    wrap: 'bg-[#fff3cd] border-[#ffe69c] text-[#664d03]',
    icon: <AlertTriangle className="h-5 w-5 text-[#997404] shrink-0 mt-0.5" />,
  },
  error: {
    wrap: 'bg-[#f8d7da] border-[#f1aeb5] text-[#58151c]',
    icon: <AlertCircle className="h-5 w-5 text-[#b02a37] shrink-0 mt-0.5" />,
  },
};

export function Alert({ tone = 'info', title, children, className = '' }: AlertProps) {
  const { wrap, icon } = TONE_STYLES[tone];
  return (
    <div className={`flex items-start gap-3 rounded border p-4 text-[15px] ${wrap} ${className}`}>
      {icon}
      <div className="flex-1 min-w-0">
        {title && <div className="font-bold mb-0.5">{title}</div>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

