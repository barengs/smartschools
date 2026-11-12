import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function Textarea({ hasError = false, className = '', ...rest }: TextareaProps) {
  return (
    <textarea
      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
        hasError
          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
      } ${className}`}
      {...rest}
    />
  );
}

