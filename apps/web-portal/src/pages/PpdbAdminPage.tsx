import { useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-toastify';
import { Badge, Button, Card, Select } from '../components/atoms';
import { DataTable } from '../components/molecules';
import { PortalTopbar } from '../components/organisms';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchPpdbApplications,
  migratePpdbApplication,
  PpdbRow,
  setFilterStatus,
  verifyPpdbApplication,
} from '../store/slices/ppdbAdminSlice';

export function PpdbAdminPage() {
  const dispatch = useAppDispatch();
  const { rows, filterStatus, message, error } = useAppSelector((s) => s.ppdbAdmin);

  useEffect(() => {
    dispatch(fetchPpdbApplications(filterStatus));
  }, [dispatch, filterStatus]);

  useEffect(() => {
    if (message) toast.success(message);
  }, [message]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const columns = useMemo<ColumnDef<PpdbRow, unknown>[]>(
    () => [
      {
        accessorKey: 'registration_number',
        header: 'No. Reg',
        cell: ({ row }) => (
          <span className="font-bold text-[#0d6efd] tabular-nums">
            {row.original.registration_number}
          </span>
        ),
      },
      {
        accessorKey: 'full_name',
        header: 'Nama Calon Siswa',
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-[#212529]">{row.original.full_name}</div>
            {row.original.nis && (
              <div className="text-xs text-[#6c757d] tabular-nums">NIS: {row.original.nis}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'admission_track',
        header: 'Jalur',
        cell: ({ row }) => <Badge tone="blue">{row.original.admission_track}</Badge>,
      },
      {
        accessorKey: 'parent_name',
        header: 'Orang Tua',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-[#212529]">{row.original.parent_name}</div>
            <div className="text-xs text-[#6c757d]">{row.original.parent_phone}</div>
          </div>
        ),
      },
      {
        id: 'documents',
        header: 'Berkas',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-[#495057]">{row.original.documents_jsonb?.length ?? 0} file</span>
        ),
      },
      {
        accessorKey: 'verification_status',
        header: 'Status',
        cell: ({ row }) => {
          const st = row.original.verification_status;
          return (
            <Badge
              tone={
                st === 'MIGRATED' || st === 'ACCEPTED'
                  ? 'emerald'
                  : st === 'REJECTED'
                    ? 'rose'
                    : 'slate'
              }
            >
              {st}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
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
          );
        },
      },
    ],
    [dispatch, filterStatus],
  );

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

      <Card padding="none" className="overflow-hidden">
        <DataTable
          data={rows}
          columns={columns}
          emptyMessage="Belum ada data pendaftaran PPDB."
        />
      </Card>
    </div>
  );
}
