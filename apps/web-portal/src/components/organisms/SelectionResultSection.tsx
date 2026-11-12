import {
  ArrowRight,
  Award,
  CheckCircle2,
  Download,
  MapPin,
  Printer,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { Alert, Badge, Button, Card } from '../atoms';

export function SelectionResultSection() {
  const { lookupResult, lookupSearched } = useAppSelector((s) => s.ppdbPublic);
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);

  if (!lookupSearched) return null;

  if (!lookupResult) {
    return (
      <Alert tone="warning" title="Data Pendaftaran Tidak Ditemukan">
        Pastikan Nomor Pendaftaran (contoh: <code>PPDB-2026-0481</code> atau{' '}
        <code>PPDB-2026-3390</code>) atau NISN yang dimasukkan sudah sesuai dengan jalur seleksi.
      </Alert>
    );
  }

  const isAccepted = lookupResult.status === 'LULUS UTAMA';

  return (
    <div className="space-y-4">
      <Card padding="none" className="overflow-hidden border-slate-200 shadow-sm">
        {/* Top status banner matching Screenshot 2 */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 text-white ${
            isAccepted
              ? 'bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#047857]'
              : 'bg-gradient-to-r from-amber-700 to-amber-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 shrink-0">
              <CheckCircle2 className="h-6 w-6 text-emerald-200" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-200">
                KEPUTUSAN PANITIA SELEKSI PENERIMAAN
              </div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                {isAccepted
                  ? 'SELAMAT! ANDA DINYATAKAN DITERIMA / LULUS SELEKSI UTAMA'
                  : `STATUS: ${lookupResult.status} — ANTREAN PELIMPAHAN KUOTA`}
              </h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/20 px-3 py-1.5 text-[11px] font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            TERVERIFIKASI SISTEM E-PPDB
          </span>
        </div>

        {/* Scorecard body */}
        <div className="p-5 sm:p-7 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Student Profile */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f2b6b] to-blue-600 text-sm font-extrabold text-white shadow-xs">
                {lookupResult.fullName
                  .split(' ')
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {isAccepted ? 'Calon Siswa Diterima' : 'Calon Siswa Terdaftar'}
                </div>
                <div className="text-base font-extrabold text-slate-900 truncate">
                  {lookupResult.fullName}
                </div>
                <div className="text-xs text-slate-600 tabular-nums">
                  NISN: {lookupResult.nisn}
                </div>
                <div className="text-xs font-bold text-[#163b8c] tabular-nums">
                  {lookupResult.registrationNumber}
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Nomor Induk Kependudukan</span>
                <span className="font-bold text-slate-800 tabular-nums">{lookupResult.nik}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Sekolah Asal</span>
                <span className="font-bold text-slate-800 text-right">
                  {lookupResult.previousSchool}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500">Status Pendaftaran</span>
                <Badge tone="emerald">Berkas Lengkap / Terverifikasi</Badge>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Waktu Terverifikasi</span>
                <span className="font-medium text-slate-700">{lookupResult.verifiedAt}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Satuan Pendidikan Penempatan
              </div>
              <div className="mt-0.5 text-sm font-extrabold text-slate-900">
                {lookupResult.schoolAccepted}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>{lookupResult.notes}</span>
              </div>
            </div>
          </div>

          {/* Right Metrics & Formula */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-5">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Matriks Rincian Penilaian Skor Terbuka
                  </h4>
                  <p className="text-xs text-slate-500">
                    Perhitungan terverifikasi algoritma geospasial Haversine &amp; CBT Pusat
                  </p>
                </div>
                <Badge tone="blue" icon={<Award className="h-3.5 w-3.5" />}>
                  Peringkat Ke-{lookupResult.rank} / Kuota 150 Kursi
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Jarak Haversine</span>
                    <MapPin className="h-3.5 w-3.5 text-[#163b8c]" />
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
                    {lookupResult.distanceMeters}{' '}
                    <span className="text-xs font-semibold text-slate-500">Meter</span>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-emerald-700">
                    Dalam Radius Zona Utama
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-[11px] font-semibold text-slate-500">Placement Test</div>
                  <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
                    {lookupResult.placementScore.toFixed(2)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">Literasi &amp; Numerasi (Rust)</div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-[11px] font-semibold text-slate-500">Nilai Rapor</div>
                  <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
                    {lookupResult.reportScore.toFixed(2)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">5 Semester Terakhir</div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-[#0f2b6b] to-[#1d4ed8] p-4 text-white shadow-md">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-blue-100">
                    <span>Nilai Akhir Gabungan</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                  <div className="mt-2 text-2xl font-extrabold tabular-nums">
                    {lookupResult.finalScore.toFixed(2)}
                  </div>
                  <div className="mt-1 text-[11px] text-blue-200 font-semibold">
                    Passing Grade: 78.50
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <div>
                  <span className="font-bold text-slate-800">Formula Pembobotan:</span> (Skor
                  Zonasi × 55%) + (CBT × 30%) + (Nilai Rapor × 15%) ={' '}
                  <strong className="text-[#163b8c]">{lookupResult.finalScore.toFixed(2)} Poin</strong>
                </div>
                <div className="inline-flex items-center gap-1.5 font-bold text-emerald-700 shrink-0">
                  <QrCode className="h-4 w-4" />
                  <span>Status Audit: ISOKV-S/M Sah</span>
                </div>
              </div>
            </div>

            {notice && (
              <Alert tone="info" title="Aksi Layanan Dokumen">
                {notice}
              </Alert>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => navigate('/login')}
              >
                Lanjutkan Daftar Ulang Online
              </Button>
              <Button
                variant="outline"
                size="md"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  setNotice(
                    `SKL Resmi untuk ${lookupResult.registrationNumber} ber-QR & TTE siap diunduh setelah login akun SSO siswa.`,
                  )
                }
              >
                Unduh SKL Resmi (PDF){' '}
                <Badge tone="blue" className="ml-1">
                  GRATIS
                </Badge>
              </Button>
              <Button
                variant="outline"
                size="md"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Cetak Kartu Lulus Mandiri
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

