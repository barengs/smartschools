import { useEffect, useState } from 'react';
import { Clock, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store';

function formatCountdown(deadlineIso: string): string {
  const diffMs = Math.max(0, new Date(deadlineIso).getTime() - Date.now());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diffMs / (1000 * 60)) % 60);
  const secs = Math.floor((diffMs / 1000) % 60);
  return `${days} Hari : ${String(hours).padStart(2, '0')} Jam : ${String(mins).padStart(2, '0')} Menit : ${String(secs).padStart(2, '0')} Detik`;
}

export function AnnouncementBar() {
  const overview = useAppSelector((s) => s.ppdbPublic.overview);
  const waveTitle = overview?.wave.title ?? 'PPDB Online TA 2026/2027 Gelombang 1';
  const remainingSeats = overview?.wave.remainingSeats ?? 236;
  const deadlineIso = overview?.wave.deadlineIso ?? '2026-11-30T23:59:59+07:00';
  const closingDateLabel = overview?.wave.closingDateLabel ?? '30 November 2026';

  const [countdown, setCountdown] = useState(() => formatCountdown(deadlineIso));

  useEffect(() => {
    setCountdown(formatCountdown(deadlineIso));
    const timer = window.setInterval(() => {
      setCountdown(formatCountdown(deadlineIso));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deadlineIso]);

  return (
    <div className="border-b border-[#9ec5fe] bg-[#cfe2ff] text-[#052c65]">
      <div className="bs-container flex flex-col md:flex-row items-center justify-between gap-2 py-2.5 text-sm">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
          <span className="inline-flex items-center gap-1 rounded bg-[#0d6efd] px-2 py-0.5 text-xs font-semibold text-white shrink-0">
            <Megaphone className="h-3.5 w-3.5" />
            Info PPDB
          </span>
          <span>
            {waveTitle} dibuka! Sisa kuota{' '}
            <Link to="/ppdb" className="font-bold text-[#052c65] underline underline-offset-2">
              {remainingSeats} Kursi
            </Link>{' '}
            hingga {closingDateLabel}.
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded border border-[#9ec5fe] bg-white px-3 py-1 text-xs font-semibold text-[#084298] tabular-nums shrink-0">
          <Clock className="h-3.5 w-3.5" />
          <span>{countdown}</span>
        </div>
      </div>
    </div>
  );
}
