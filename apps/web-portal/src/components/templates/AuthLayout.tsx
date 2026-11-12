import React from 'react';

interface AuthLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function AuthLayout({ left, right }: AuthLayoutProps) {
  return (
    <section className="bs-container py-10 lg:py-14">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 flex">
          <div className="w-full flex-1 flex flex-col">{left}</div>
        </div>
        <div className="lg:col-span-7 flex">
          <div className="w-full flex-1 flex flex-col">{right}</div>
        </div>
      </div>
    </section>
  );
}
