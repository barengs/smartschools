import { useEffect, useState } from 'react';
import { ApiError, apiRequest } from '../api/client';

interface PpdbRow {
  id: string;
  registration_number: string;
  full_name: string;
  nis: string | null;
  admission_track: string;
  parent_name: string;
  parent_phone: string;
  verification_status: string;
  documents_jsonb: Array<{ documentType: string; fileName: string }>;
}

export function PpdbAdminPage() {
  const [rows, setRows] = useState<PpdbRow[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(status = filterStatus) {
    setError(null);
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    try {
      const data = await apiRequest<PpdbRow[]>(`/api/v1/core/ppdb${query}`);
      setRows(data);
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal memuat data PPDB');
    }
  }

  useEffect(() => {
    load();
  }, [filterStatus]);

  async function verify(id: string, status: 'VERIFIED' | 'ACCEPTED' | 'REJECTED') {
    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/api/v1/core/ppdb/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage(`Status diperbarui menjadi ${status}`);
      await load();
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal memperbarui status');
    }
  }

  async function migrate(id: string) {
    setError(null);
    setMessage(null);
    try {
      const res = await apiRequest<{ nis: string; parentUsername: string }>(
        `/api/v1/core/ppdb/${id}/migrate`,
        {
          method: 'POST',
          body: JSON.stringify({ dailySpendingLimit: 25000 }),
        },
      );
      setMessage(
        `One-Click Migration sukses! NIS: ${res.nis}, Akun Ortu: ${res.parentUsername}`,
      );
      await load();
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal migrasi siswa');
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Manajemen E-PPDB &amp; One-Click Migration</h1>
          <p className="muted">
            Verifikasi pendaftar lalu migrasikan siswa diterima ke Buku Induk, Dompet Kantin, dan
            Kartu Pelajar.
          </p>
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="DRAFT">DRAFT</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="MIGRATED">MIGRATED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </header>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. Reg</th>
              <th>Nama Calon Siswa</th>
              <th>Jalur</th>
              <th>Orang Tua</th>
              <th>Berkas</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <code>{r.registration_number}</code>
                </td>
                <td>
                  <strong>{r.full_name}</strong>
                  {r.nis && <div className="muted">NIS: {r.nis}</div>}
                </td>
                <td>{r.admission_track}</td>
                <td>
                  {r.parent_name}
                  <div className="muted">{r.parent_phone}</div>
                </td>
                <td>{r.documents_jsonb?.length ?? 0} file</td>
                <td>
                  <span className="status-chip">{r.verification_status}</span>
                </td>
                <td className="actions-cell">
                  {r.verification_status !== 'MIGRATED' && (
                    <>
                      <button
                        type="button"
                        className="btn-sm"
                        onClick={() => verify(r.id, 'VERIFIED')}
                      >
                        Verifikasi
                      </button>
                      <button
                        type="button"
                        className="btn-sm ok"
                        onClick={() => verify(r.id, 'ACCEPTED')}
                      >
                        Terima
                      </button>
                      <button
                        type="button"
                        className="btn-sm danger"
                        onClick={() => verify(r.id, 'REJECTED')}
                      >
                        Tolak
                      </button>
                    </>
                  )}
                  {r.verification_status === 'ACCEPTED' && (
                    <button
                      type="button"
                      className="btn-sm primary"
                      onClick={() => migrate(r.id)}
                    >
                      1-Click Migrate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="muted" style={{ textAlign: 'center' }}>
                  Belum ada data pendaftaran PPDB.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
