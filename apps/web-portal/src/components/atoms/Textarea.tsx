import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function Textarea({ hasError = false, className = '', ...rest }: TextareaProps) {
  return (
    <textarea
      className={`w-full rounded border bg-white px-3 py-2 text-base text-[#212529] placeholder:text-[#6c757d] transition-colors focus:outline-none focus:ring-2 ${
        hasError
          ? 'border-[#dc3545] focus:border-[#dc3545] focus:ring-[#dc3545]/25'
          : 'border-[#ced4da] focus:border-[#86b7fe] focus:ring-[#0d6efd]/25'
      } ${className}`}
      {...rest}
    />
  );
}

