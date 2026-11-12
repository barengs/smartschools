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
      className={`flex items-center rounded border bg-white transition-colors focus-within:ring-2 ${
        hasError
          ? 'border-[#dc3545] focus-within:border-[#dc3545] focus-within:ring-[#dc3545]/25'
          : 'border-[#ced4da] focus-within:border-[#86b7fe] focus-within:ring-[#0d6efd]/25'
      }`}
    >
      {leftIcon && (
        <span className="pl-3 text-[#6c757d] flex items-center shrink-0">{leftIcon}</span>
      )}
      <select
        className={`w-full bg-transparent px-3 py-2 text-base text-[#212529] focus:outline-none ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}

