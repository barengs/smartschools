import React from 'react';

interface AuthLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function AuthLayout({ left, right }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100">
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">{left}</div>
          <div className="lg:col-span-7 flex items-center">
            <div className="w-full">{right}</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-4 text-[11px] text-slate-500">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 SmartSchool Integrated Ecosystem. Hak Cipta Dilindungi Undang-Undang.</span>
          <div className="flex items-center gap-4">
            <a href="#privasi" className="hover:text-slate-800">
              Kebijakan Privasi
            </a>
            <span>•</span>
            <a href="#ketentuan" className="hover:text-slate-800">
              Ketentuan Layanan
            </a>
            <span>•</span>
            <a href="#status" className="hover:text-slate-800">
              Status Server
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

