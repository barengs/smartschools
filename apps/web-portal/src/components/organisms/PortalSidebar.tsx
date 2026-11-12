import { useState } from 'react';
import {
  Activity,
  BookMarked,
  BookOpen,
  Boxes,
  CalendarDays,
  ClipboardCheck,
  FileBadge2,
  FileSpreadsheet,
  HeartHandshake,
  Laptop,
  LayoutGrid,
  LogOut,
  Menu,
  NotebookPen,
  ShieldCheck,
  Store,
  UserCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { hasAnyRole, logoutUser } from '../../store/slices/authSlice';
import { BrandLogo } from '../atoms';

interface SidebarNavItem {
  to: string;
  label: string;
  badgeText?: string;
  badgeTone?: 'rose' | 'blue';
  roles?: string[];
  icon:
    | 'ews'
    | 'buku-induk'
    | 'siakad'
    | 'jadwal'
    | 'erapor'
    | 'ppdb'
    | 'my-ppdb'
    | 'jurnal'
    | 'lms'
    | 'cbt'
    | 'finance'
    | 'pos'
    | 'kesiswaan'
    | 'perpus'
    | 'sarpras'
    | 'users';
}

interface SidebarGroup {
  groupLabel: string;
  items: SidebarNavItem[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    groupLabel: 'EKSEKUTIF & DASHBOARD',
    items: [
      {
        to: '/dashboard',
        label: 'Executive & EWS',
        badgeText: '3 Alert',
        badgeTone: 'rose',
        icon: 'ews',
      },
    ],
  },
  {
    groupLabel: 'AKADEMIK & DATA',
    items: [
      {
        to: '/buku-induk',
        label: 'Buku Induk Siswa 360°',
        roles: ['SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH', 'WAKA_KURIKULUM', 'GURU'],
        icon: 'buku-induk',
      },
      {
        to: '/siakad',
        label: 'SIAKAD Utama',
        roles: ['SUPER_ADMIN', 'WAKA_KURIKULUM', 'STAF_TU', 'KEPALA_SEKOLAH'],
        icon: 'siakad',
      },
      {
        to: '/jadwal',
        label: 'Jadwal Pelajaran',
        roles: ['SUPER_ADMIN', 'WAKA_KURIKULUM', 'STAF_TU', 'KEPALA_SEKOLAH', 'GURU', 'SISWA'],
        icon: 'jadwal',
      },
      {
        to: '/e-rapor',
        label: 'E-Rapor Digital TTE',
        roles: ['SUPER_ADMIN', 'WAKA_KURIKULUM', 'GURU', 'KEPALA_SEKOLAH', 'SISWA'],
        icon: 'erapor',
      },
    ],
  },
  {
    groupLabel: 'PENERIMAAN',
    items: [
      {
        to: '/ppdb-admin',
        label: 'E-PPDB & Verifikasi',
        badgeText: 'Baru',
        badgeTone: 'blue',
        roles: ['SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH'],
        icon: 'ppdb',
      },
      {
        to: '/my-ppdb',
        label: 'Status PPDB Saya',
        roles: ['SISWA'],
        icon: 'my-ppdb',
      },
    ],
  },
  {
    groupLabel: 'PEMBELAJARAN',
    items: [
      {
        to: '/jurnal-guru',
        label: 'Jurnal Mengajar Guru',
        roles: ['SUPER_ADMIN', 'GURU', 'WAKA_KURIKULUM', 'KEPALA_SEKOLAH'],
        icon: 'jurnal',
      },
      {
        to: '/smart-lms',
        label: 'Smart LMS',
        roles: ['SUPER_ADMIN', 'GURU', 'WAKA_KURIKULUM', 'KEPALA_SEKOLAH', 'SISWA'],
        icon: 'lms',
      },
      {
        to: '/bank-soal-cbt',
        label: 'Bank Soal CBT',
        roles: ['SUPER_ADMIN', 'GURU', 'WAKA_KURIKULUM', 'KEPALA_SEKOLAH'],
        icon: 'cbt',
      },
    ],
  },
  {
    groupLabel: 'KEUANGAN & OPERASIONAL',
    items: [
      {
        to: '/finance',
        label: 'E-Finance & SPP',
        roles: ['SUPER_ADMIN', 'BENDAHARA', 'KEPALA_SEKOLAH', 'STAF_TU'],
        icon: 'finance',
      },
      {
        to: '/pos-kantin',
        label: 'POS Kantin Cashless',
        roles: ['SUPER_ADMIN', 'BENDAHARA', 'KEPALA_SEKOLAH', 'STAF_TU'],
        icon: 'pos',
      },
      {
        to: '/kesiswaan',
        label: 'Kesiswaan (E-BK/UKS)',
        roles: ['SUPER_ADMIN', 'GURU', 'KEPALA_SEKOLAH', 'STAF_TU', 'WAKA_KURIKULUM'],
        icon: 'kesiswaan',
      },
      {
        to: '/perpustakaan',
        label: 'Perpustakaan',
        roles: ['SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH', 'GURU', 'SISWA'],
        icon: 'perpus',
      },
      {
        to: '/sarpras',
        label: 'Sarpras & Aset',
        roles: ['SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH', 'BENDAHARA', 'GURU'],
        icon: 'sarpras',
      },
      {
        to: '/users',
        label: 'Pengguna & RBAC',
        roles: ['SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH'],
        icon: 'users',
      },
    ],
  },
];

function renderIcon(icon: SidebarNavItem['icon']) {
  switch (icon) {
    case 'ews':
      return <Activity className="h-4 w-4 shrink-0" />;
    case 'buku-induk':
      return <UserCheck className="h-4 w-4 shrink-0" />;
    case 'siakad':
      return <LayoutGrid className="h-4 w-4 shrink-0" />;
    case 'jadwal':
      return <CalendarDays className="h-4 w-4 shrink-0" />;
    case 'erapor':
      return <FileBadge2 className="h-4 w-4 shrink-0" />;
    case 'ppdb':
      return <ShieldCheck className="h-4 w-4 shrink-0" />;
    case 'my-ppdb':
      return <ClipboardCheck className="h-4 w-4 shrink-0" />;
    case 'jurnal':
      return <NotebookPen className="h-4 w-4 shrink-0" />;
    case 'lms':
      return <Laptop className="h-4 w-4 shrink-0" />;
    case 'cbt':
      return <FileSpreadsheet className="h-4 w-4 shrink-0" />;
    case 'finance':
      return <Wallet className="h-4 w-4 shrink-0" />;
    case 'pos':
      return <Store className="h-4 w-4 shrink-0" />;
    case 'kesiswaan':
      return <HeartHandshake className="h-4 w-4 shrink-0" />;
    case 'perpus':
      return <BookMarked className="h-4 w-4 shrink-0" />;
    case 'sarpras':
      return <Boxes className="h-4 w-4 shrink-0" />;
    case 'users':
      return <Users className="h-4 w-4 shrink-0" />;
  }
}

export function PortalSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const session = useAppSelector((s) => s.auth.session);

  async function handleLogout() {
    await dispatch(logoutUser());
    navigate('/login');
  }

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200 px-3.5 py-4">
      <div>
        <div className="flex items-center justify-between px-2 pb-4 border-b border-slate-100">
          <Link to="/" className="inline-block">
            <BrandLogo variant="dark" subtitle="TERINTEGRASI 360°" compact />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden rounded p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Tutup Menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-4 space-y-5 overflow-y-auto max-h-[calc(100vh-195px)] pr-0.5">
          {SIDEBAR_GROUPS.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.roles || hasAnyRole(session, item.roles),
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.groupLabel}>
                <div className="px-2.5 mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  {group.groupLabel}
                </div>
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between gap-2 rounded px-3 py-2 text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#163b8c] text-white shadow-sm shadow-blue-900/15'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className="flex items-center gap-2.5 min-w-0">
                            {renderIcon(item.icon)}
                            <span className="truncate">{item.label}</span>
                          </span>
                          {item.badgeText && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold shrink-0 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.badgeTone === 'rose'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-blue-100 text-[#163b8c]'
                              }`}
                            >
                              {item.badgeText}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 space-y-2.5">
        <div className="flex items-center justify-between rounded bg-slate-50 border border-slate-200/80 px-3 py-2 text-[11px]">
          <span className="font-semibold text-slate-600 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-[#163b8c]" />
            <span>E-Server Cloud</span>
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Normal
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Keluar SSO</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
        <Link to="/">
          <BrandLogo variant="dark" subtitle="TERINTEGRASI 360°" compact />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"
        >
          <Menu className="h-4 w-4" />
          <span>Menu Portal</span>
        </button>
      </div>

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-72 max-w-[85vw] h-full shadow-2xl">{navContent}</div>
          <div
            className="flex-1 bg-slate-900/40 backdrop-blur-2xs"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
