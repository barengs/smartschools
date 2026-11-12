import { Bell, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setAcademicYear } from '../../store/slices/portalSlice';
import { Badge } from '../atoms';

interface PortalTopbarProps {
  title?: string;
  subtitle?: string;
  kicker?: string;
  breadcrumbs?: string;
  rightSlot?: React.ReactNode;
  showUtilityStrip?: boolean;
}

export function PortalTopbar({
  title,
  subtitle,
  kicker,
  breadcrumbs,
  rightSlot,
  showUtilityStrip = true,
}: PortalTopbarProps) {
  const dispatch = useAppDispatch();
  const session = useAppSelector((s) => s.auth.session);
  const academicYear = useAppSelector((s) => s.portal.academicYear);

  const initials = (session?.user.username ?? 'SS')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-5">
      {showUtilityStrip && (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-7 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-[#163b8c]" />
              <span>TAHUN AJARAN</span>
            </span>
            <select
              value={academicYear}
              onChange={(e) => dispatch(setAcademicYear(e.target.value))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="TA 2026/2027 Ganjil">TA 2026/2027 Ganjil</option>
              <option value="TA 2026/2027 Genap">TA 2026/2027 Genap</option>
              <option value="TA 2025/2026 Genap">TA 2025/2026 Genap</option>
            </select>
            <Badge tone="emerald">Aktif</Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </span>

            <button
              type="button"
              className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
            </button>

            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
              <div className="text-right hidden sm:block leading-tight">
                <div className="text-xs font-extrabold text-slate-900">
                  {session?.user.username ?? 'Nurul Hidayati'}
                </div>
                <div className="text-[10px] font-medium text-slate-500">
                  {session?.user.roles[0] ?? 'Kepala Sekolah'}
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#163b8c] text-xs font-extrabold text-white">
                {initials}
              </div>
            </div>
          </div>
        </div>
      )}

      {title && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {breadcrumbs && (
              <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 mb-1">
                {breadcrumbs}
              </div>
            )}
            {kicker && (
              <div className="mb-1.5">
                <Badge tone="blue" uppercase>
                  {kicker}
                </Badge>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-600">{subtitle}</p>}
          </div>
          {rightSlot && <div className="flex items-center gap-2.5 flex-wrap shrink-0">{rightSlot}</div>}
        </div>
      )}
    </div>
  );
}
