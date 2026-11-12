import { Outlet } from 'react-router-dom';
import { PublicFooter, PublicNavbar } from '../organisms';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

