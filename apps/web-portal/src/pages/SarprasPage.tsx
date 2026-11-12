import { useState } from 'react';
import { Boxes, Building2, CalendarCheck2, QrCode, Wrench } from 'lucide-react';
import { Alert, Badge, Button, Card } from '../components/atoms';
import { ProgressMeter } from '../components/molecules';
import { ModuleWorkspaceShell, PortalTopbar } from '../components/organisms';

export function SarprasPage() {
  const [ticketNotice, setTicketNotice] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PortalTopbar
        breadcrumbs="KEUANGAN & OPERASIONAL / MANAJEMEN ASET & SARPRAS"
        title="Sarpras: Inventaris KIB A–F QR, Booking Ruang & Maintenance"
        subtitle="Hierarki Gedung/Lantai/Ruang, stiker QR/NFC aset, PO/BAPP/BAST pengadaan BOS, booking ruang anti-bentrok KBM, BHP FIFO, & penyusutan/afkir TTE."
        rightSlot={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<QrCode className="h-3.5 w-3.5" />}
            onClick={() =>
              setTicketNotice(
                'Scan QR Aset #INV-KIB-LAB2-014 (Kalorimeter Digital) tercatat. Tiket perbaikan dikirim ke teknisi sarpras dengan SLA 24 jam.',
              )
            }
          >
            Laporkan Kerusakan via Scan QR
          </Button>
        }
      />

      {ticketNotice && <Alert tone="info">{ticketNotice}</Alert>}

      <ModuleWorkspaceShell
        banner={{
          tone: 'emerald',
          tag: 'Validasi Anti-Bentrok Schedules',
          message: 'Booking ruang lab/aula terhubung langsung ke jadwal pelajaran SIAKAD & terintegrasi ke jurnal penyusutan E-Finance.',
        }}
        kpis={[
          { label: 'Total Aset Terdaftar (QR)', value: '2.410 Unit', sublabel: 'Standar KIB A–F / BMD & Yayasan', icon: <Boxes className="h-4 w-4" /> },
          { label: 'Lokasi Gedung & Ruangan', value: '58 Ruang', sublabel: 'Gedung A–C, Lab Sains, Aula', icon: <Building2 className="h-4 w-4" /> },
          { label: 'Tiket Perbaikan Terbuka', value: '4 Tiket', sublabel: '100% Sesuai SLA Preventive', icon: <Wrench className="h-4 w-4 text-amber-600" /> },
          { label: 'Booking Ruang Minggu Ini', value: '16 Sesi', sublabel: '0 Bentrok dengan Jadwal KBM', icon: <CalendarCheck2 className="h-4 w-4 text-emerald-600" /> },
        ]}
        tabs={[
          {
            key: 'assets',
            label: 'Inventaris KIB A–F & Mutasi QR',
            content: (
              <div className="space-y-3 text-xs">
                <h3 className="text-base font-extrabold text-slate-900">Daftar Inventaris Ruangan &amp; Kondisi Fisik</h3>
                {[
                  { qr: 'QR-KIBB-2026-0041', name: 'Smartboard Interactive 75" (Lab Fisika 2)', source: 'BOS Kinerja 2026', pic: 'Ir. Rahmat Hidayat', cond: 'GOOD' },
                  { qr: 'QR-KIBB-2025-0118', name: 'AC Inverter 2 PK Ruang XI MIPA 1', source: 'Yayasan / Komite', pic: 'Teknisi Sarpras', cond: 'MINOR_DAMAGE' },
                  { qr: 'QR-KIBB-2024-0302', name: 'Proyektor Laser Aula Utama', source: 'BOS Reguler', pic: 'Staf Sarpras', cond: 'GOOD' },
                ].map((a) => (
                  <div key={a.qr} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded border border-slate-200 p-3.5">
                    <div>
                      <div className="font-mono text-[11px] font-bold text-[#163b8c]">{a.qr}</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">{a.name}</div>
                      <div className="text-slate-500">Sumber: {a.source} · PIC: {a.pic}</div>
                    </div>
                    <Badge tone={a.cond === 'GOOD' ? 'emerald' : 'amber'}>{a.cond}</Badge>
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: 'bhp',
            label: 'BHP FIFO, Booking & Penyusutan',
            content: (
              <div className="space-y-3 text-xs text-slate-600">
                <h3 className="text-base font-extrabold text-slate-900">Barang Habis Pakai (BHP) &amp; Valuasi Penyusutan</h3>
                <p>Pergerakan stok ATK &amp; bahan praktikum laboratorium dipantau secara FIFO/FEFO dengan alert stok minimum, sedangkan penyusutan aset tetap (garis lurus) dijurnal otomatis ke akun CoA E-Finance.</p>
              </div>
            ),
          },
        ]}
        rightRail={
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Kesehatan Aset &amp; Stok BHP</h3>
            <ProgressMeter label="Kondisi Aset Baik (GOOD)" rightTop="96.5%" percentage={96.5} tone="emerald" />
            <ProgressMeter label="Kepatuhan Preventive Maintenance" rightTop="92%" percentage={92} tone="blue" />
            <ProgressMeter label="Ketersediaan Stok Minimum BHP" rightTop="85%" percentage={85} tone="teal" />
          </Card>
        }
      />
    </div>
  );
}
