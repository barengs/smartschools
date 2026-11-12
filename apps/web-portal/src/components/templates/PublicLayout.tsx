import { Outlet } from 'react-router-dom';
import { PublicFooter, PublicNavbar } from '../organisms';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa] overflow-x-hidden">
      <PublicNavbar />
      <main className="flex-1 min-w-0 w-full">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

