import { ChangeEvent, useEffect, useState } from 'react';
import { ApiError, apiRequest } from '../api/client';

interface MyPpdb {
  id: string;
  registration_number: string;
  full_name: string;
  admission_track: string;
  verification_status: string;
  verification_notes: string | null;
  nis: string | null;
  documents_jsonb: Array<{
    documentType: string;
    objectKey: string;
    fileName: string;
    uploadedAt: string;
  }>;
}

export function MyPpdbPage() {
  const [app, setApp] = useState<MyPpdb | null>(null);
  const [docType, setDocType] = useState<'KK' | 'AKTA' | 'IJAZAH' | 'RAPOR' | 'PHOTO'>('KK');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await apiRequest<MyPpdb>('/api/v1/core/ppdb/my');
      setApp(data);
    } catch (err) {
      setError((err as ApiError).message ?? 'Data PPDB tidak ditemukan');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !app) return;

    setError(null);
    setStatusMsg('Membuat URL upload MinIO...');
    try {
      const presigned = await apiRequest<{ url: string; objectKey: string }>(
        `/api/v1/core/ppdb/${app.id}/documents/presign`,
        {
          method: 'POST',
          body: JSON.stringify({ documentType: docType, fileName: file.name }),
        },
      );

      setStatusMsg('Mengunggah berkas ke Object Storage...');
      const uploadRes = await fetch(presigned.url, {
        method: 'PUT',
        body: file,
      });
      if (!uploadRes.ok) {
        throw new Error(`Upload ke MinIO gagal (HTTP ${uploadRes.status})`);
      }

      await apiRequest(`/api/v1/core/ppdb/${app.id}/documents`, {
        method: 'POST',
        body: JSON.stringify({
          documentType: docType,
          objectKey: presigned.objectKey,
          fileName: file.name,
        }),
      });

      setStatusMsg(`Berkas ${file.name} berhasil diunggah!`);
      await load();
    } catch (err) {
      setError((err as Error).message ?? 'Gagal mengunggah berkas');
      setStatusMsg(null);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Status Pendaftaran E-PPDB Saya</h1>
      </header>

      {error && <div className="alert-error">{error}</div>}
      {statusMsg && <div className="alert-success">{statusMsg}</div>}

      {app && (
        <div className="card">
          <h3>{app.full_name}</h3>
          <p>
            No. Pendaftaran: <strong>{app.registration_number}</strong> | Jalur:{' '}
            <strong>{app.admission_track}</strong>
          </p>
          <p>
            Status Verifikasi:{' '}
            <span className="status-chip ok">{app.verification_status}</span>
            {app.nis && (
              <>
                {' '}
                | NIS Aktif: <strong>{app.nis}</strong>
              </>
            )}
          </p>
          {app.verification_notes && (
            <p className="muted">Catatan Panitia: {app.verification_notes}</p>
          )}

          <hr />
          <h4>Unggah Dokumen Persyaratan</h4>
          <div className="inline-row">
            <select
              value={docType}
              onChange={(e) =>
                setDocType(
                  e.target.value as 'KK' | 'AKTA' | 'IJAZAH' | 'RAPOR' | 'PHOTO',
                )
              }
            >
              <option value="KK">Kartu Keluarga (KK)</option>
              <option value="AKTA">Akta Kelahiran</option>
              <option value="IJAZAH">Ijazah / SKL</option>
              <option value="RAPOR">Rapor</option>
              <option value="PHOTO">Pas Foto</option>
            </select>
            <input type="file" onChange={handleFileUpload} />
          </div>

          <ul>
            {app.documents_jsonb.map((d) => (
              <li key={d.objectKey}>
                <strong>{d.documentType}</strong>: {d.fileName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
