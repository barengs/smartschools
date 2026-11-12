import { useState } from 'react';
import { Menu, User, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { BrandLogo, Button } from '../atoms';

const PUBLIC_NAV_LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/#jalur-masuk', label: 'Jalur Masuk', hash: true },
  { to: '/#biaya-ppdb', label: 'Biaya', hash: true },
  { to: '/status-seleksi', label: 'Status Seleksi' },
  { to: '/#bantuan-ppdb', label: 'Bantuan', hash: true },
];

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useAppSelector((s) => s.auth.session);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="hover:opacity-95 transition-opacity">
          <BrandLogo variant="dark" subtitle="INTEGRATED ECOSYSTEM" />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {PUBLIC_NAV_LINKS.map((item) =>
            item.hash ? (
              <a
                key={item.label}
                href={item.to}
                className="text-sm font-medium text-slate-600 hover:text-[#163b8c] transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-[#163b8c] underline decoration-2 underline-offset-8'
                      : 'text-slate-600 hover:text-[#163b8c]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          {session ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              leftIcon={<User className="h-4 w-4" />}
            >
              Portal ({session.user.username})
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              Masuk
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => navigate('/ppdb')}>
            Daftar Sekarang
          </Button>
          <button
            type="button"
            title={session ? 'Buka Dashboard SSO' : 'Masuk Akun'}
            onClick={() => navigate(session ? '/dashboard' : '/login')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <User className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2">
            {PUBLIC_NAV_LINKS.map((item) =>
              item.hash ? (
                <a
                  key={item.label}
                  href={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-semibold ${
                      isActive ? 'bg-blue-50 text-[#163b8c]' : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => {
                setMobileOpen(false);
                navigate(session ? '/dashboard' : '/login');
              }}
            >
              {session ? 'Portal ERP' : 'Masuk'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => {
                setMobileOpen(false);
                navigate('/ppdb');
              }}
            >
              Daftar Sekarang
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

