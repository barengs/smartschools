import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  hasError?: boolean;
}

export function Input({
  leftIcon,
  rightSlot,
  hasError = false,
  className = '',
  ...rest
}: InputProps) {
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
      <input
        className={`w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 ${className}`}
        {...rest}
      />
      {rightSlot && <span className="pr-3 flex items-center shrink-0">{rightSlot}</span>}
    </div>
  );
}

