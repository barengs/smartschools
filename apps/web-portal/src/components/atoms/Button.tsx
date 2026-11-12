import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'emerald' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0d6efd] hover:bg-[#0b5ed7] active:bg-[#0a58ca] text-white border border-[#0d6efd]',
  secondary:
    'bg-[#6c757d] hover:bg-[#5c636a] text-white border border-[#6c757d]',
  outline:
    'bg-white hover:bg-[#f8f9fa] text-[#0d6efd] border border-[#0d6efd]',
  ghost:
    'bg-transparent hover:bg-[#e9ecef] text-[#212529] border border-[#dee2e6]',
  emerald:
    'bg-[#198754] hover:bg-[#157347] text-white border border-[#198754]',
  danger:
    'bg-[#dc3545] hover:bg-[#bb2d3b] text-white border border-[#dc3545]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-sm gap-1.5 sm:whitespace-nowrap',
  md: 'px-4 py-2 text-[15px] rounded gap-2 sm:whitespace-nowrap',
  lg: 'px-5 py-2.5 text-base rounded gap-2 sm:whitespace-nowrap',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}

