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
    <div className="space-y-4">
      {showUtilityStrip && (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-7 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#dee2e6] bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#495057]">
              <Calendar className="h-4 w-4 text-[#0d6efd]" />
              <span>Periode:</span>
            </span>
            <select
              value={academicYear}
              onChange={(e) => dispatch(setAcademicYear(e.target.value))}
              className="rounded border border-[#ced4da] bg-white px-2.5 py-1 text-sm font-medium text-[#212529] focus:outline-none focus:border-[#0d6efd]"
            >
              <option value="TA 2026/2027 Ganjil">TA 2026/2027 Ganjil</option>
              <option value="TA 2026/2027 Genap">TA 2026/2027 Genap</option>
              <option value="TA 2025/2026 Genap">TA 2025/2026 Genap</option>
            </select>
            <Badge tone="emerald">Aktif</Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded border border-[#a3cfbb] bg-[#d1e7dd] px-2.5 py-0.5 text-xs font-semibold text-[#0a3622]">
              <span className="h-2 w-2 rounded-full bg-[#198754]" />
              Online
            </span>

            <button
              type="button"
              className="relative rounded p-1.5 text-[#495057] hover:bg-[#f8f9fa] cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 border-l border-[#dee2e6] pl-3">
              <div className="text-right hidden sm:block leading-tight">
                <div className="text-sm font-semibold text-[#212529]">
                  {session?.user.username ?? 'Nurul Hidayati'}
                </div>
                <div className="text-xs text-[#6c757d]">
                  {session?.user.roles[0] ?? 'Kepala Sekolah'}
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d6efd] text-xs font-bold text-white">
                {initials}
              </div>
            </div>
          </div>
        </div>
      )}

      {title && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#dee2e6] pb-4">
          <div>
            {breadcrumbs && (
              <div className="text-xs font-medium text-[#6c757d] mb-1">
                {breadcrumbs}
              </div>
            )}
            {kicker && (
              <div className="mb-1.5">
                <Badge tone="blue">{kicker}</Badge>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#212529]">
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
