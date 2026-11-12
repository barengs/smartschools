import { Outlet } from 'react-router-dom';
import { PortalSidebar } from '../organisms';

export function PortalLayout() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#f8f9fa]">
      <PortalSidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1360px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
