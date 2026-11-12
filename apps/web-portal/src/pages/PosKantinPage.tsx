import { useState } from 'react';
import { CreditCard, ShieldCheck, Store, Zap } from 'lucide-react';
import { Alert, Badge, Button, Card } from '../components/atoms';
import { ProgressMeter } from '../components/molecules';
import { ModuleWorkspaceShell, PortalTopbar } from '../components/organisms';

export function PosKantinPage() {
  const [posNotice, setPosNotice] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PortalTopbar
        breadcrumbs="KEUANGAN & OPERASIONAL / ATOMIC WALLET RUST"
        title="POS Kantin Cashless & Dompet Digital Siswa"
        subtitle="Transaksi potong saldo atomik < 5 ms (SELECT ... FOR UPDATE + Idempotency-Key), kontrol batas jajan harian Parent App, & payout merchant."
        rightSlot={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Zap className="h-3.5 w-3.5" />}
            onClick={() =>
              setPosNotice(
                'Simulasi POST /api/v1/engine/pos/pay (Idempotency-Key UUID v4) berhasil dalam 3.8 ms. Event WalletDeducted terkirim ke Parent App.',
              )
            }
          >
            Uji Tap POS (Idempotent)
          </Button>
        }
      />

      {posNotice && <Alert tone="success">{posNotice}</Alert>}

      <ModuleWorkspaceShell
        banner={{
          tone: 'emerald',
          tag: 'BIGINT Ledger • 0% Race Condition',
          message: 'Seluruh saldo disimpan dalam integer penuh rupiah tanpa floating point · Tap ganda otomatis ditolak oleh guard Redis + DB.',
        }}
        kpis={[
          { label: 'Transaksi Kantin Hari Ini', value: '842 Tx', sublabel: '18 tx / menit saat istirahat', icon: <Store className="h-4 w-4" /> },
          { label: 'Latensi Proses POS Rust', value: '3.8 ms', sublabel: 'SLA Target < 5 ms', icon: <Zap className="h-4 w-4 text-emerald-600" /> },
          { label: 'Error Double-Deduct', value: '0%', sublabel: 'Idempotency Key Tervalidasi', icon: <ShieldCheck className="h-4 w-4 text-emerald-600" /> },
          { label: 'Saldo Merchant Siap Cair', value: 'Rp 19,2 jt', sublabel: 'Sinkron ke Settlement E-Finance', icon: <CreditCard className="h-4 w-4" /> },
        ]}
        tabs={[
          {
            key: 'live',
            label: 'Log Transaksi Kantin Live',
            content: (
              <div className="space-y-3 text-xs">
                <h3 className="text-base font-extrabold text-slate-900">Arus Buku Besar `wallet_transactions` (Service B Rust)</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500">
                        <th className="px-4 py-3">Waktu</th>
                        <th className="px-4 py-3">Siswa (RFID UID)</th>
                        <th className="px-4 py-3">Merchant / Pos</th>
                        <th className="px-4 py-3">Nominal</th>
                        <th className="px-4 py-3">Status Atomik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {[
                        { time: '10:18:04', student: 'Muhammad Farhan (4A:7C:99:B2)', merchant: 'Kantin Sehat Blok A (Paket Nasi)', amount: 'Rp 15.000', status: 'COMMITTED (3.4 ms)' },
                        { time: '10:17:52', student: 'Aisyah Azzahra (9C:11:3B:7D)', merchant: 'Koperasi Siswa (Alat Gambar)', amount: 'Rp 12.000', status: 'COMMITTED (4.1 ms)' },
                        { time: '10:15:10', student: 'Rafi Maulana (7B:09:1E:44)', merchant: 'Perpustakaan (LIBRARY_FINE)', amount: 'Rp 5.000', status: 'CHARGED ATOMIC' },
                      ].map((tx) => (
                        <tr key={tx.time}>
                          <td className="px-4 py-3 font-bold tabular-nums">{tx.time}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{tx.student}</td>
                          <td className="px-4 py-3 text-slate-600">{tx.merchant}</td>
                          <td className="px-4 py-3 font-extrabold tabular-nums">{tx.amount}</td>
                          <td className="px-4 py-3"><Badge tone="emerald">{tx.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ),
          },
          {
            key: 'limits',
            label: 'Kontrol Limit Jajan & Top-Up QRIS',
            content: (
              <div className="space-y-3 text-xs text-slate-600">
                <h3 className="text-base font-extrabold text-slate-900">Kebijakan Parent Super-App</h3>
                <p>Orang tua mengatur batas jajan harian per anak (contoh Rp25.000/hari) dan melakukan top-up QRIS otomatis via webhook Node.js → Rust credit.</p>
              </div>
            ),
          },
        ]}
        rightRail={
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Performa Merchant Hari Ini</h3>
            <ProgressMeter label="Kantin Sehat Blok A" rightTop="Rp 12.450.000" percentage={78} tone="blue" />
            <ProgressMeter label="Koperasi Siswa & ATK" rightTop="Rp 6.820.000" percentage={52} tone="teal" />
          </Card>
        }
      />
    </div>
  );
}
