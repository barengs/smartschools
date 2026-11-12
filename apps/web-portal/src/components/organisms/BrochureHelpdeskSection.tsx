import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronRight, Download, Headphones, MessageSquare, PhoneCall, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { setFeeModalOpen } from '../../store/slices/ppdbPublicSlice';
import { Button, Card, SectionHeading } from '../atoms';
import { DataTable } from '../molecules';

interface FeeRow {
  component: string;
  nominal: string;
  notes: string;
}

export function BrochureHelpdeskSection() {
  const dispatch = useAppDispatch();
  const { overview, feeModalOpen } = useAppSelector((s) => s.ppdbPublic);

  const feeSchedule: FeeRow[] = overview?.feeSchedule ?? [
    {
      component: 'Biaya Pendaftaran & Seleksi CBT',
      nominal: 'Gratis (Rp 0)',
      notes: 'Ditanggung subsidi operasional sekolah',
    },
    {
      component: 'Dana Sumbangan Pendidikan (DSP)',
      nominal: 'Rp 0 - Rp 3.500.000',
      notes: 'Gratis untuk Jalur Afirmasi KIP/PIP',
    },
    {
      component: 'Iuran SPP Bulanan',
      nominal: 'Rp 250.000 / bulan',
      notes: 'Pembayaran via Virtual Account & QRIS',
    },
    {
      component: 'Atribut, Seragam Khas & Kartu RFID',
      nominal: 'Rp 850.000',
      notes: 'Dibayarkan setelah dinyatakan lulus',
    },
  ];

  const columns = useMemo<ColumnDef<FeeRow, unknown>[]>(
    () => [
      {
        accessorKey: 'component',
        header: 'Komponen Biaya',
        cell: ({ row }) => <span className="font-medium text-[#212529]">{row.original.component}</span>,
      },
      {
        accessorKey: 'nominal',
        header: 'Nominal',
        cell: ({ row }) => (
          <span className="font-semibold text-[#0d6efd] whitespace-nowrap tabular-nums">
            {row.original.nominal}
          </span>
        ),
      },
      {
        accessorKey: 'notes',
        header: 'Keterangan',
        cell: ({ row }) => <span className="text-[#6c757d]">{row.original.notes}</span>,
      },
    ],
    [],
  );

  return (
    <section id="biaya-ppdb" className="py-12 bg-[#f8f9fa]">
      <div className="bs-container" id="bantuan-ppdb">
        <SectionHeading
          kicker="Informasi Pembiayaan & Bantuan"
          title="Rincian Biaya Pendidikan & Layanan Helpdesk"
          subtitle="Daftar estimasi komponen pembiayaan pendidikan resmi serta saluran konsultasi panitia PPDB."
        />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <Card padding="none" className="lg:col-span-7 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dee2e6] bg-[#f8f9fa] px-5 py-3.5">
              <h3 className="text-base font-bold text-[#212529]">
                Komponen Biaya PPDB &amp; SPP TA 2026/2027
              </h3>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => dispatch(setFeeModalOpen(true))}
              >
                Pratinjau Brosur
              </Button>
            </div>
            <DataTable data={feeSchedule} columns={columns} />
          </Card>

          <Card padding="none" className="lg:col-span-5 overflow-hidden">
            <div className="bg-[#0d6efd] px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <Headphones className="h-5 w-5" />
                <div>
                  <h3 className="text-base font-bold">Helpdesk Panitia PPDB</h3>
                  <p className="text-xs text-blue-100">
                    Bantuan verifikasi berkas, titik zonasi, dan kendala akun
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#dee2e6] bg-white">
              <a
                href="https://wa.me/6281123456789"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-5 py-4 hover:bg-[#f8f9fa] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-[#198754] shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[#212529]">WhatsApp Center PPDB</div>
                    <div className="text-xs text-[#6c757d]">+62 811-2345-6789 (07.30 - 16.00 WIB)</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#6c757d]" />
              </a>

              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <PhoneCall className="h-5 w-5 text-[#0d6efd] shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[#212529]">Hotline Tata Usaha</div>
                    <div className="text-xs text-[#6c757d]">(0251) 800-1234 (Ext. 101)</div>
                  </div>
                </div>
                <span className="rounded bg-[#e9ecef] px-2.5 py-1 text-xs font-medium text-[#495057]">
                  Senin - Sabtu
                </span>
              </div>

              <div className="px-5 py-4 bg-[#f8f9fa] flex flex-wrap gap-2">
                <Link
                  to="/status-seleksi"
                  className="inline-flex items-center justify-center rounded border border-[#0d6efd] bg-white px-4 py-2 text-sm font-semibold text-[#0d6efd] hover:bg-[#f8f9fa]"
                >
                  Cek Status Seleksi
                </Link>
                <Link
                  to="/ppdb"
                  className="inline-flex items-center justify-center rounded bg-[#0d6efd] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b5ed7]"
                >
                  Isi Formulir PPDB
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {feeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl overflow-hidden rounded border border-[#dee2e6] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#dee2e6] bg-[#f8f9fa] px-5 py-3.5">
              <h3 className="text-lg font-bold text-[#212529]">
                Panduan Brosur &amp; Rincian Biaya PPDB
              </h3>
              <button
                type="button"
                onClick={() => dispatch(setFeeModalOpen(false))}
                className="rounded p-1 text-[#6c757d] hover:bg-[#e9ecef]"
                aria-label="Tutup modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-[#495057]">
                Berikut ringkasan jadwal dan komponen pembiayaan resmi{' '}
                <strong>{overview?.schoolName ?? 'SMA Negeri Nusantara Unggul'}</strong> untuk{' '}
                <strong>{overview?.wave.title ?? 'TA 2026/2027 Gelombang 1'}</strong>:
              </p>
              <div className="rounded border border-[#dee2e6] overflow-hidden">
                <DataTable data={feeSchedule} columns={columns} compact />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#dee2e6] bg-[#f8f9fa] px-5 py-3">
              <Button variant="ghost" size="sm" onClick={() => window.print()}>
                Cetak Halaman
              </Button>
              <Button variant="primary" size="sm" onClick={() => dispatch(setFeeModalOpen(false))}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
