import { useEffect } from 'react';
import { Alert, Badge, Button, Card, Select } from '../components/atoms';
import { PortalTopbar } from '../components/organisms';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchPpdbApplications,
  migratePpdbApplication,
  setFilterStatus,
  verifyPpdbApplication,
} from '../store/slices/ppdbAdminSlice';

export function PpdbAdminPage() {
  const dispatch = useAppDispatch();
  const { rows, filterStatus, message, error } = useAppSelector((s) => s.ppdbAdmin);

  useEffect(() => {
    dispatch(fetchPpdbApplications(filterStatus));
  }, [dispatch, filterStatus]);

  return (
    <div className="space-y-6">
      <PortalTopbar
        title="Manajemen E-PPDB & One-Click Migration"
        subtitle="Verifikasi pendaftar lalu migrasikan siswa diterima ke Buku Induk, Dompet Kantin, dan Kartu Pelajar."
        rightSlot={
          <div className="w-48">
            <Select
              value={filterStatus}
              onChange={(e) => dispatch(setFilterStatus(e.target.value))}
            >
              <option value="">Semua Status</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="MIGRATED">MIGRATED</option>
              <option value="REJECTED">REJECTED</option>
            </Select>
          </div>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">No. Reg</th>
                <th className="px-4 py-3">Nama Calon Siswa</th>
                <th className="px-4 py-3">Jalur</th>
                <th className="px-4 py-3">Orang Tua</th>
                <th className="px-4 py-3">Berkas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-bold text-[#163b8c] tabular-nums">
                    {r.registration_number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{r.full_name}</div>
                    {r.nis && <div className="text-xs text-slate-500 tabular-nums">NIS: {r.nis}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="blue">{r.admission_track}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{r.parent_name}</div>
                    <div className="text-xs text-slate-500">{r.parent_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.documents_jsonb?.length ?? 0} file</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        r.verification_status === 'MIGRATED' || r.verification_status === 'ACCEPTED'
                          ? 'emerald'
                          : r.verification_status === 'REJECTED'
                            ? 'rose'
                            : 'slate'
                      }
                    >
                      {r.verification_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {r.verification_status !== 'MIGRATED' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              dispatch(
                                verifyPpdbApplication({
                                  id: r.id,
                                  status: 'VERIFIED',
                                  filterStatus,
                                }),
                              )
                            }
                          >
                            Verifikasi
                          </Button>
                          <Button
                            size="sm"
                            variant="emerald"
                            onClick={() =>
                              dispatch(
                                verifyPpdbApplication({
                                  id: r.id,
                                  status: 'ACCEPTED',
                                  filterStatus,
                                }),
                              )
                            }
                          >
                            Terima
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              dispatch(
                                verifyPpdbApplication({
                                  id: r.id,
                                  status: 'REJECTED',
                                  filterStatus,
                                }),
                              )
                            }
                          >
                            Tolak
                          </Button>
                        </>
                      )}
                      {r.verification_status === 'ACCEPTED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => dispatch(migratePpdbApplication({ id: r.id, filterStatus }))}
                        >
                          1-Click Migrate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Belum ada data pendaftaran PPDB.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
