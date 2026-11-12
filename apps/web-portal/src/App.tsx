import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PortalLayout, PublicLayout } from './components/templates';
import { BukuIndukPage } from './pages/BukuIndukPage';
import { CbtBankPage } from './pages/CbtBankPage';
import { DashboardPage } from './pages/DashboardPage';
import { ERaporPage } from './pages/ERaporPage';
import { FinancePage } from './pages/FinancePage';
import { LandingPage } from './pages/LandingPage';
import { LibraryPage } from './pages/LibraryPage';
import { LoginPage } from './pages/LoginPage';
import { MyPpdbPage } from './pages/MyPpdbPage';
import { PosKantinPage } from './pages/PosKantinPage';
import { PpdbAdminPage } from './pages/PpdbAdminPage';
import { PpdbPublicPage } from './pages/PpdbPublicPage';
import { SarprasPage } from './pages/SarprasPage';
import { SchedulePage } from './pages/SchedulePage';
import { SelectionStatusPage } from './pages/SelectionStatusPage';
import { SiakadPage } from './pages/SiakadPage';
import { SmartLmsPage } from './pages/SmartLmsPage';
import { StudentCarePage } from './pages/StudentCarePage';
import { TeacherJournalPage } from './pages/TeacherJournalPage';
import { UsersPage } from './pages/UsersPage';
import { useAppSelector } from './store';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const session = useAppSelector((s) => s.auth.session);
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public E-PPDB & Ecosystem Showcase Routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/ppdb" element={<PpdbPublicPage />} />
          <Route path="/status-seleksi" element={<SelectionStatusPage />} />
        </Route>

        {/* Standalone Unified SSO Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Core ERP Portal Routes */}
        <Route
          element={
            <RequireAuth>
              <PortalLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/buku-induk" element={<BukuIndukPage />} />
          <Route path="/siakad" element={<SiakadPage />} />
          <Route path="/jadwal" element={<SchedulePage />} />
          <Route path="/e-rapor" element={<ERaporPage />} />
          <Route path="/ppdb-admin" element={<PpdbAdminPage />} />
          <Route path="/my-ppdb" element={<MyPpdbPage />} />
          <Route path="/jurnal-guru" element={<TeacherJournalPage />} />
          <Route path="/smart-lms" element={<SmartLmsPage />} />
          <Route path="/bank-soal-cbt" element={<CbtBankPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/pos-kantin" element={<PosKantinPage />} />
          <Route path="/kesiswaan" element={<StudentCarePage />} />
          <Route path="/perpustakaan" element={<LibraryPage />} />
          <Route path="/sarpras" element={<SarprasPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
