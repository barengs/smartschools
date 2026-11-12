import { useState } from 'react';
import { BookMarked, BookOpen, CheckCircle2, CreditCard, QrCode, Search } from 'lucide-react';
import { Alert, Badge, Button, Card, Input } from '../components/atoms';
import { ProgressMeter } from '../components/molecules';
import { ModuleWorkspaceShell, PortalTopbar } from '../components/organisms';

const CATALOG_BOOKS = [
  { isbn: '978-602-244-812-4', ddc: '530 FIS', title: 'Fisika Fase F Kurikulum Merdeka — Termodinamika & Gelombang', author: 'Kemendikbudristek', copies: '42 / 45 Tersedia', ebook: 'DRM MinIO Aktif' },
  { isbn: '978-623-00-4912-1', ddc: '005.1 INF', title: 'Algoritma Pemrograman & Struktur Data Modern', author: 'Dr. Rinaldi Munir', copies: '12 / 14 Tersedia', ebook: 'DRM MinIO Aktif' },
  { isbn: '978-979-433-901-8', ddc: '899.2 IND', title: 'Antologi Esai Sastra Nusantara & Retorika Akademik', author: 'Prof. H.B. Jassin', copies: '0 / 8 (Antrean: 3 Siswa)', ebook: 'PDF Watermark' },
];

export function LibraryPage() {
  const [search, setSearch] = useState('');
  const [fineNotice, setFineNotice] = useState<string | null>(null);

  const filtered = CATALOG_BOOKS.filter(
    (b) =>
      !search.trim() ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.ddc.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PortalTopbar
        breadcrumbs="KEUANGAN & OPERASIONAL / PERPUSTAKAAN DIGITAL"
        title="E-Library: Katalog OPAC DDC, Sirkulasi Kiosk & E-Book DRM"
        subtitle="Klasifikasi DDC & barcode per eksemplar, booking antrean, Self-Service Kiosk, pelunasan denda Wallet Rust (LIBRARY_FINE), & verifikasi Bebas Pustaka."
        rightSlot={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CreditCard className="h-3.5 w-3.5" />}
            onClick={() =>
              setFineNotice(
                'POST /internal/engine/wallets/charge (LIBRARY_FINE) berhasil memotong denda keterlambatan Rp5.000 secara atomik dari dompet siswa.',
              )
            }
          >
            Bayar Denda via Wallet Rust
          </Button>
        }
      />

      {fineNotice && <Alert tone="success">{fineNotice}</Alert>}

      <ModuleWorkspaceShell
        banner={{
          tone: 'blue',
          tag: 'Self-Service Kiosk & DRM Active',
          message: 'Integrasi syarat Bebas Pustaka otomatis memvalidasi proses mutasi keluar & kelulusan pada Buku Induk 360°.',
        }}
        kpis={[
          { label: 'Judul & Eksemplar DDC', value: '4.280 Judul', sublabel: '14.650 Eksemplar Barcode/RFID', icon: <BookMarked className="h-4 w-4" /> },
          { label: 'Peminjaman Aktif', value: '312 Buku', sublabel: '68 Pinjaman via Self-Service Kiosk', icon: <QrCode className="h-4 w-4" /> },
          { label: 'Koleksi E-Book DRM', value: '960 Judul', sublabel: 'HTTP Range + Watermark Pembaca', icon: <BookOpen className="h-4 w-4" /> },
          { label: 'Bebas Pustaka Kelulusan', value: '99.2%', sublabel: 'Sinkron ke Buku Induk & SIAKAD', icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" /> },
        ]}
        tabs={[
          {
            key: 'opac',
            label: 'Katalog OPAC & Eksemplar DDC',
            content: (
              <div className="space-y-4">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul buku, ISBN, atau klasifikasi DDC..."
                  leftIcon={<Search className="h-4 w-4" />}
                />
                <div className="space-y-2.5 text-xs">
                  {filtered.map((b) => (
                    <div key={b.isbn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded border border-slate-200 p-3.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge tone="navy">{b.ddc}</Badge>
                          <span className="font-mono text-[11px] text-slate-500">ISBN {b.isbn}</span>
                        </div>
                        <div className="mt-1 text-sm font-extrabold text-slate-900">{b.title}</div>
                        <div className="text-slate-500">{b.author} · {b.ebook}</div>
                      </div>
                      <Badge tone={b.copies.startsWith('0') ? 'amber' : 'emerald'}>{b.copies}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            key: 'circulation',
            label: 'Sirkulasi, Denda & Bebas Pustaka',
            content: (
              <div className="space-y-3 text-xs text-slate-600">
                <h3 className="text-base font-extrabold text-slate-900">Aturan Sirkulasi &amp; Distribusi Buku Paket</h3>
                <p>Hari libur pada Kalender Akademik SIAKAD otomatis dikecualikan dari perhitungan denda keterlambatan. Siswa dapat memperpanjang pinjaman dari Student App jika tidak ada antrean booking.</p>
              </div>
            ),
          },
        ]}
        rightRail={
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Audit Stock Opname Tahunan</h3>
            <ProgressMeter label="Buku Paket Kurikulum Merdeka" rightTop="100% Terdistribusi" percentage={100} tone="emerald" />
            <ProgressMeter label="Scan Barcode Stock Opname" rightTop="88%" percentage={88} tone="blue" />
          </Card>
        }
      />
    </div>
  );
}
