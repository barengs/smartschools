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
    wrap: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />,
  },
  success: {
    wrap: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />,
  },
  warning: {
    wrap: 'bg-rose-50/80 border-rose-200 text-rose-950',
    icon: <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />,
  },
  error: {
    wrap: 'bg-rose-50 border-rose-200 text-rose-900',
    icon: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />,
  },
};

export function Alert({ tone = 'info', title, children, className = '' }: AlertProps) {
  const { wrap, icon } = TONE_STYLES[tone];
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${wrap} ${className}`}>
      {icon}
      <div className="flex-1 min-w-0">
        {title && <div className="font-bold mb-0.5">{title}</div>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

