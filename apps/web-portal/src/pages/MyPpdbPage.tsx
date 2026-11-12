import { ChangeEvent, useEffect, useState } from 'react';
import { FileCheck2, FileUp } from 'lucide-react';
import { ApiError, apiRequest } from '../api/client';
import { Alert, Badge, Card, Select } from '../components/atoms';
import { FormField } from '../components/molecules';
import { PortalTopbar } from '../components/organisms';

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
    <div className="space-y-6">
      <PortalTopbar
        title="Status Pendaftaran E-PPDB Saya"
        subtitle="Pantau proses verifikasi berkas oleh panitia dan unggah dokumen persyaratan MinIO."
      />

      {error && <Alert tone="error">{error}</Alert>}
      {statusMsg && <Alert tone="success">{statusMsg}</Alert>}

      {app && (
        <Card padding="lg" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{app.full_name}</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                No. Pendaftaran: <strong className="text-[#163b8c]">{app.registration_number}</strong>{' '}
                · Jalur: <strong>{app.admission_track}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="emerald">{app.verification_status}</Badge>
              {app.nis && <Badge tone="blue">NIS Aktif: {app.nis}</Badge>}
            </div>
          </div>

          {app.verification_notes && (
            <Alert tone="info" title="Catatan Panitia Verifikator">
              {app.verification_notes}
            </Alert>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileUp className="h-4 w-4 text-[#163b8c]" />
              <span>Unggah Dokumen Persyaratan</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <FormField label="Jenis Dokumen">
                <Select
                  value={docType}
                  onChange={(e) =>
                    setDocType(e.target.value as 'KK' | 'AKTA' | 'IJAZAH' | 'RAPOR' | 'PHOTO')
                  }
                >
                  <option value="KK">Kartu Keluarga (KK)</option>
                  <option value="AKTA">Akta Kelahiran</option>
                  <option value="IJAZAH">Ijazah / SKL</option>
                  <option value="RAPOR">Rapor</option>
                  <option value="PHOTO">Pas Foto</option>
                </Select>
              </FormField>
              <FormField label="Pilih File">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[#163b8c]"
                />
              </FormField>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Dokumen Terunggah
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {app.documents_jsonb.map((d) => (
                <div
                  key={d.objectKey}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs"
                >
                  <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900">{d.documentType}</div>
                    <div className="text-slate-500 truncate">{d.fileName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
