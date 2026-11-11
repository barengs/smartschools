import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface HealthStatus {
  status: string;
  service: string;
  dependencies: {
    postgres: string;
    redis: string;
  };
  timestamp: string;
}

export function DashboardPage() {
  const { session, hasAnyRole } = useAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    apiRequest<HealthStatus>('/api/v1/core/health', {}, false)
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Selamat Datang, {session?.user.username}</h1>
          <p className="muted">
            Peran aktif: <strong>{session?.user.roles.join(', ')}</strong>
          </p>
        </div>
        {health && (
          <div className="status-chip ok">
            Core ERP: {health.status.toUpperCase()} (PG: {health.dependencies.postgres}, Redis:{' '}
            {health.dependencies.redis})
          </div>
        )}
      </header>

      <div className="card-grid">
        {hasAnyRole(['SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH']) && (
          <div className="card">
            <h3>Manajemen E-PPDB</h3>
            <p className="muted">
              Verifikasi berkas calon siswa, tetapkan kelulusan, dan lakukan One-Click Migration ke
              Buku Induk &amp; Dompet Kantin.
            </p>
            <Link to="/ppdb-admin" className="btn-link">
              Buka Manajemen E-PPDB →
            </Link>
          </div>
        )}

        {hasAnyRole(['SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH']) && (
          <div className="card">
            <h3>Pengguna &amp; Hak Akses (RBAC)</h3>
            <p className="muted">
              Kelola akun Kepala Sekolah, Guru, TU, Bendahara, Orang Tua, dan Siswa dari satu pusat
              SSO.
            </p>
            <Link to="/users" className="btn-link">
              Kelola Pengguna →
            </Link>
          </div>
        )}

        {hasAnyRole(['SISWA']) && (
          <div className="card">
            <h3>Status Pendaftaran E-PPDB</h3>
            <p className="muted">
              Pantau status verifikasi pendaftaran Anda dan unggah berkas persyaratan (KK, Akta,
              Ijazah).
            </p>
            <Link to="/my-ppdb" className="btn-link">
              Lihat Status Saya →
            </Link>
          </div>
        )}

        <div className="card">
          <h3>Portal Pendaftaran E-PPDB Publik</h3>
          <p className="muted">
            Formulir pendaftaran daring bagi calon siswa baru lengkap dengan pembuatan tagihan
            otomatis.
          </p>
          <Link to="/ppdb" className="btn-link">
            Buka Formulir PPDB →
          </Link>
        </div>
      </div>
    </div>
  );
}

