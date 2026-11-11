import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface NavItem {
  to: string;
  label: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Beranda' },
  { to: '/my-ppdb', label: 'Status PPDB Saya', roles: ['SISWA'] },
  {
    to: '/ppdb-admin',
    label: 'Manajemen E-PPDB',
    roles: ['SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH'],
  },
  {
    to: '/users',
    label: 'Pengguna & RBAC',
    roles: ['SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH'],
  },
];

export function AppLayout() {
  const { session, logout, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || hasAnyRole(item.roles),
  );

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-title">Smart School</div>
          <div className="brand-sub">Portal Terpadu</div>
        </div>
        <nav className="nav-list">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/ppdb" className="nav-link">
            Formulir PPDB Publik ↗
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-pill">
            <strong>{session?.user.username}</strong>
            <span>{session?.user.roles.join(', ')}</span>
          </div>
          <button type="button" className="btn-secondary" onClick={handleLogout}>
            Keluar SSO
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
