import React from 'react';

interface AuthFeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function AuthFeatureItem({ icon, title, description }: AuthFeatureItemProps) {
  return (
    <div className="flex items-start gap-3.5 rounded border border-white/15 bg-white/10 p-4 backdrop-blur-xs">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-white/15 text-blue-100">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-white">{title}</div>
        <p className="mt-0.5 text-xs leading-relaxed text-blue-100/85">{description}</p>
      </div>
    </div>
  );
}

