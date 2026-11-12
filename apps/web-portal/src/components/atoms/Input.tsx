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
      className={`flex items-center rounded border bg-white transition-colors focus-within:ring-2 ${
        hasError
          ? 'border-[#dc3545] focus-within:border-[#dc3545] focus-within:ring-[#dc3545]/25'
          : 'border-[#ced4da] focus-within:border-[#86b7fe] focus-within:ring-[#0d6efd]/25'
      }`}
    >
      {leftIcon && (
        <span className="pl-3 text-[#6c757d] flex items-center shrink-0">{leftIcon}</span>
      )}
      <input
        className={`w-full bg-transparent px-3 py-2 text-base text-[#212529] placeholder:text-[#6c757d] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#e9ecef] ${className}`}
        {...rest}
      />
      {rightSlot && <span className="pr-3 flex items-center shrink-0">{rightSlot}</span>}
    </div>
  );
}

