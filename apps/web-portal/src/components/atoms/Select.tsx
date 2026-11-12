import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  leftIcon?: React.ReactNode;
  hasError?: boolean;
}

export function Select({
  leftIcon,
  hasError = false,
  className = '',
  children,
  ...rest
}: SelectProps) {
  return (
    <div
      className={`flex items-center rounded-xl border bg-white transition-colors focus-within:ring-2 ${
        hasError
          ? 'border-rose-300 focus-within:border-rose-500 focus-within:ring-rose-100'
          : 'border-slate-300 focus-within:border-blue-600 focus-within:ring-blue-100'
      }`}
    >
      {leftIcon && (
        <span className="pl-3.5 text-slate-400 flex items-center shrink-0">{leftIcon}</span>
      )}
      <select
        className={`w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}

