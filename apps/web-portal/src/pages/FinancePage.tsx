import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { BookOpenCheck, CheckCircle2, Clock, Landmark, ReceiptText, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge, Button, Card, Input } from '../components/atoms';
import { DataTable, ProgressMeter, StatCard } from '../components/molecules';
import { PortalTopbar } from '../components/organisms';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchFinanceOverview, generateBulkSppInvoices, Invoice } from '../store/slices/financeSlice';
import { formatRupiah } from '../utils/format';

type FinanceTab = 'BILLING' | 'RKAS_BOS' | 'JURNAL_PAYROLL' | 'SETTLEMENT';

export function FinancePage() {
  const dispatch = useAppDispatch();
  const { invoices, summary, message, error } = useAppSelector((s) => s.finance);

  const [tab, setTab] = useState<FinanceTab>('BILLING');
  const [amount, setAmount] = useState(500000);
  const [dueDate, setDueDate] = useState('2026-12-10');

  useEffect(() => {
    dispatch(fetchFinanceOverview());
  }, [dispatch]);

  useEffect(() => {
    if (message) toast.success(message);
  }, [message]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const invoiceColumns = useMemo<ColumnDef<Invoice, unknown>[]>(
    () => [
      {
        accessorKey: 'invoice_number',
        header: 'No. Invoice',
        cell: ({ row }) => (
          <span className="font-bold text-[#0d6efd] tabular-nums">
            {row.original.invoice_number}
          </span>
        ),
      },
      {
        accessorKey: 'student_name',
        header: 'Siswa',
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-[#212529]">{row.original.student_name}</div>
            {row.original.nis && (
              <div className="text-xs text-[#6c757d] tabular-nums">NIS: {row.original.nis}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'billing_type',
        header: 'Jenis',
      },
      {
        accessorKey: 'amount',
        header: 'Nominal',
        cell: ({ row }) => (
          <span className="font-bold tabular-nums">{formatRupiah(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: 'va_number',
        header: 'VA',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-[#495057]">{row.original.va_number ?? '-'}</span>
        ),
      },
      {
        accessorKey: 'due_date',
        header: 'Jatuh Tempo',
        cell: ({ row }) => <span className="tabular-nums">{row.original.due_date}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge tone={row.original.status === 'PAID' ? 'emerald' : 'amber'}>
            {row.original.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  async function handleGenerateBulkSpp(e: FormEvent) {
    e.preventDefault();
    await dispatch(generateBulkSppInvoices({ amount: Number(amount), dueDate }));
  }

  return (
    <div className="space-y-6">
      <PortalTopbar
        breadcrumbs="KEUANGAN & OPERASIONAL / E-FINANCE TERPADU"
        title="E-Finance, RKAS/BOS, Jurnal Ganda & Payroll GTK"
        subtitle="Penerbitan tagihan SPP + beasiswa, VA/QRIS HMAC webhook, dunning H-7/H-0/H+7, RKAS/ARKAS, CoA ISAK 35, Payroll JP, & settlement kantin."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tagihan Diterbitkan"
          value={summary ? formatRupiah(summary.totals.total_billed) : 'Rp 482.500.000'}
          sublabel="VA Bank, QRIS Dinamis, & Loket"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Sudah Terbayar (Lunas)"
          value={summary ? formatRupiah(summary.totals.total_paid) : 'Rp 454.515.000'}
          sublabel="Tervalidasi HMAC Webhook Idempoten"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          label="Belum Lunas (Piutang / Dunning)"
          value={summary ? formatRupiah(summary.totals.total_unpaid) : 'Rp 27.985.000'}
          sublabel="Pengingat H-7 / H-0 / H+7 WA Aktif"
          icon={<Clock className="h-4 w-4 text-amber-600" />}
        />
        <StatCard
          label="Serapan Dana BOS & RKAS"
          value="81.0%"
          sublabel="Selaras Ekspor ARKAS Kemendikbud"
          icon={<Landmark className="h-4 w-4" />}
        />
      </div>

      {/* Tab strip */}
      <div className="flex flex-wrap items-center gap-1.5 rounded border border-slate-200 bg-white p-1.5 shadow-2xs">
        {(
          [
            { key: 'BILLING', label: 'Billing SPP, Beasiswa & Dunning' },
            { key: 'RKAS_BOS', label: 'RKAS, Dana BOS & Approval RAB' },
            { key: 'JURNAL_PAYROLL', label: 'Akuntansi Jurnal Ganda & Payroll GTK' },
            { key: 'SETTLEMENT', label: 'Settlement Merchant Kantin' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
              tab === t.key
                ? 'bg-[#163b8c] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'BILLING' && (
        <div className="space-y-6">
          <Card padding="lg" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                Terbitkan Tagihan SPP Massal (Semua Siswa Aktif)
              </h2>
              <Badge tone="emerald">Auto-Apply Diskon KIP/Prestasi</Badge>
            </div>
            <form onSubmit={handleGenerateBulkSpp} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                type="number"
                min={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" size="md">
                Generate SPP Massal
              </Button>
            </form>
          </Card>

          <Card padding="none" className="overflow-hidden">
            <DataTable
              data={invoices}
              columns={invoiceColumns}
              emptyMessage="Belum ada invoice tersimpan atau server Core ERP sedang offline."
            />
          </Card>
        </div>
      )}

      {tab === 'RKAS_BOS' && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              Realisasi Anggaran RKAS, Dana BOS &amp; Kas Kecil (Imprest)
            </h2>
            <Badge tone="blue">ARKAS Compatible</Badge>
          </div>
          <div className="space-y-4">
            <ProgressMeter label="BOS Reguler — Pengembangan Perpustakaan & Sarpras" rightTop="Rp 640 jt / Rp 790 jt (81%)" percentage={81} tone="blue" />
            <ProgressMeter label="BOS Kinerja — Digitalisasi Pembelajaran Smart LMS" rightTop="Rp 120 jt / Rp 150 jt (80%)" percentage={80} tone="teal" />
            <ProgressMeter label="Kas Kecil Imprest Operasional KBM" rightTop="Rp 8,5 jt / Rp 20 jt (42.5%)" percentage={42.5} tone="emerald" />
          </div>
        </Card>
      )}

      {tab === 'JURNAL_PAYROLL' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card padding="lg" className="space-y-3">
            <div className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <BookOpenCheck className="h-5 w-5 text-[#163b8c]" />
              <span>Buku Besar Jurnal Ganda (CoA ISAK 35)</span>
            </div>
            <p className="text-xs text-slate-600">
              Setiap invoice <code>PAID</code>, pencairan SPJ BOS, top-up dompet, &amp; penyusutan aset sarpras membangkitkan entri Debit/Kredit otomatis.
            </p>
            <div className="rounded border border-slate-200 p-3 text-xs space-y-1">
              <div className="flex justify-between font-bold"><span>1101 · Kas Bank BNI Operasional (Debit)</span><span className="tabular-nums">Rp 454.515.000</span></div>
              <div className="flex justify-between text-slate-600"><span>4101 · Pendapatan SPP &amp; Pendidikan (Kredit)</span><span className="tabular-nums">Rp 454.515.000</span></div>
            </div>
          </Card>

          <Card padding="lg" className="space-y-3">
            <div className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <ReceiptText className="h-5 w-5 text-emerald-600" />
              <span>Payroll GTK &amp; Honor Kelebihan JP SIAKAD</span>
            </div>
            <p className="text-xs text-slate-600">
              Kalkulasi gaji pokok, tunjangan wali kelas, honor mengajar dari <code>teaching_journals</code>, serta potongan BPJS &amp; PPh 21.
            </p>
            <div className="rounded border border-emerald-200 bg-emerald-50/70 p-3 text-xs flex justify-between items-center">
              <span className="font-bold text-emerald-900">Periode November 2026 (68 GTK)</span>
              <Badge tone="emerald">Siap Transfer &amp; Slip PDF</Badge>
            </div>
          </Card>
        </div>
      )}

      {tab === 'SETTLEMENT' && (
        <Card padding="lg" className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900">
            Rekonsiliasi Saldo &amp; Payout Merchant Kantin Cashless (Rust Ledger)
          </h2>
          <p className="text-xs text-slate-600">
            Menarik akumulasi transaksi <code>high_speed_ops.wallet_transactions</code> (`POS_PURCHASE` &amp; `LIBRARY_FINE`) untuk transfer ke rekening pedagang kantin &amp; koperasi tanpa selisih rupiah.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <Card padding="sm"><div className="font-bold">Kantin Sehat Blok A</div><div className="text-lg font-extrabold text-[#163b8c] tabular-nums mt-1">Rp 12.450.000</div></Card>
            <Card padding="sm"><div className="font-bold">Koperasi Siswa &amp; ATK</div><div className="text-lg font-extrabold text-[#163b8c] tabular-nums mt-1">Rp 6.820.000</div></Card>
            <Card padding="sm"><div className="font-bold">Pos Denda Perpustakaan</div><div className="text-lg font-extrabold text-emerald-700 tabular-nums mt-1">Rp 340.000</div></Card>
          </div>
        </Card>
      )}
    </div>
  );
}
