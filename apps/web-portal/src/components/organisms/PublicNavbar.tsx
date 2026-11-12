import { useState } from 'react';
import { Menu, User, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { BrandLogo, Button } from '../atoms';

const PUBLIC_NAV_LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/#jalur-masuk', label: 'Jalur Masuk', hash: true },
  { to: '/#biaya-ppdb', label: 'Biaya & Jadwal', hash: true },
  { to: '/status-seleksi', label: 'Status Seleksi' },
  { to: '/#bantuan-ppdb', label: 'Bantuan', hash: true },
];

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useAppSelector((s) => s.auth.session);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-[#dee2e6] bg-white">
      <div className="bs-container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <BrandLogo variant="dark" subtitle="Portal Akademik & PPDB" compact />
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {PUBLIC_NAV_LINKS.map((item) =>
            item.hash ? (
              <a
                key={item.label}
                href={item.to}
                className="text-[15px] font-medium text-[#495057] hover:text-[#0d6efd] transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-[15px] font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-[#0d6efd] font-semibold'
                      : 'text-[#495057] hover:text-[#0d6efd]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
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
              Masuk Portal
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => navigate('/ppdb')}>
            Daftar PPDB
          </Button>
        </div>

        <button
          type="button"
          className="lg:hidden rounded-md border border-[#dee2e6] p-2 text-[#495057] hover:bg-[#f8f9fa]"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[#dee2e6] bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col gap-1">
            {PUBLIC_NAV_LINKS.map((item) =>
              item.hash ? (
                <a
                  key={item.label}
                  href={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-base font-medium text-[#495057] hover:bg-[#f8f9fa]"
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
                    `rounded-md px-3 py-2 text-base font-medium ${
                      isActive ? 'bg-[#cfe2ff]/50 text-[#0a58ca] font-semibold' : 'text-[#495057] hover:bg-[#f8f9fa]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-[#dee2e6]">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                setMobileOpen(false);
                navigate(session ? '/dashboard' : '/login');
              }}
            >
              {session ? 'Buka Portal ERP' : 'Masuk Portal'}
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                setMobileOpen(false);
                navigate('/ppdb');
              }}
            >
              Daftar PPDB
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
