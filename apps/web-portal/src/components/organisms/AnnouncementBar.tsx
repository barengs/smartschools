import { Clock, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AnnouncementBar() {
  return (
    <div className="border-b border-blue-100 bg-[#edf3ff]">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-slate-700 text-center sm:text-left">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#163b8c] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shrink-0">
            <Megaphone className="h-3 w-3" />
            INFO PPDB
          </span>
          <span>
            PPDB Online TA 2026/2027 Gelombang 1 Dibuka! Kuota tersedia{' '}
            <Link to="/ppdb" className="font-bold text-[#163b8c] underline underline-offset-2">
              240 Kursi
            </Link>{' '}
            untuk Zonasi &amp; Prestasi · Tutup 30 November 2026
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-bold text-[#163b8c] tabular-nums shrink-0">
          <Clock className="h-3.5 w-3.5" />
          <span>Sisa Waktu: 19 H : 08 J : 45 M</span>
        </div>
      </div>
    </div>
  );
}

