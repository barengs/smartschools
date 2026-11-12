import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  rightSlot?: React.ReactNode;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required = false,
  rightSlot,
  hint,
  error,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {label}
          {required && <span className="text-rose-600 ml-0.5">*</span>}
        </label>
        {rightSlot && <div className="text-xs text-slate-500">{rightSlot}</div>}
      </div>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-500">{hint}</p>}
      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}

