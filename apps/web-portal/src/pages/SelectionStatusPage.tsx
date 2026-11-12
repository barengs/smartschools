import { Download, HelpCircle, Mail, MessageSquare, Share2, ShieldCheck } from 'lucide-react';
import { Badge, Button, Card } from '../components/atoms';
import {
  ReEnrollmentGuide,
  SelectionLookupCard,
  SelectionRecapSection,
  SelectionResultSection,
} from '../components/organisms';

export function SelectionStatusPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Header strip matching Screenshot 2 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-3xl">
          <Badge tone="emerald" uppercase>
            PENGUMUMAN RESMI HASIL SELEKSI E-PPDB TA 2026/2027
          </Badge>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Pengumuman Hasil Akhir Seleksi E-PPDB
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Masukkan Nomor Registrasi PPDB atau NISN calon peserta didik untuk memeriksa hasil
            seleksi secara instan dan mengunduh Surat Keterangan Kelulusan (SKL) resmi ber-QR Code
            dengan verifikasi elektronik.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 1200, behavior: 'smooth' })}>
            Statistik Kelulusan
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Share2 className="h-3.5 w-3.5" />}
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
          >
            Bagikan
          </Button>
        </div>
      </div>

      <SelectionLookupCard />
      <SelectionResultSection />
      <ReEnrollmentGuide />
      <SelectionRecapSection />

      {/* Bottom Helpdesk & Secretariat matching Screenshot 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card padding="none" className="lg:col-span-5 overflow-hidden">
          <div className="bg-gradient-to-br from-[#0f2b6b] to-blue-700 p-6 text-white">
            <Badge tone="blue" className="bg-white/15 text-white border-white/25">
              Layanan Konsultasi Offline
            </Badge>
            <h3 className="mt-3 text-lg font-extrabold">Sekretariat Panitia PPDB Kampus</h3>
            <p className="mt-1 text-xs text-blue-100">
              Gedung Pusat Administrasi Lt. 1, Ruang Pelayanan Terpadu Satu Pintu
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 p-4 bg-white">
            <div>
              <div className="text-xs font-extrabold text-slate-900">
                Dokumen SK Penetapan Kelulusan Lengkap
              </div>
              <div className="text-[11px] text-slate-500">
                PDF Resmi Bermeterai Digital (2.4 MB)
              </div>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
              Unduh
            </Button>
          </div>
        </Card>

        <Card padding="lg" className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#163b8c]">
              <HelpCircle className="h-4 w-4" />
              <span>Masa Sanggah &amp; Layanan Pengaduan Resmi</span>
            </div>
            <h3 className="mt-2 text-xl font-extrabold text-slate-900">
              Pusat Bantuan &amp; Klarifikasi Nilai
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
              Jika terdapat ketidaksesuaian berkas nilai rapor, koordinat titik zonasi, atau
              membutuhkan panduan pembayaran daftar ulang, hubungi tim verifikator kami melalui
              saluran resmi berikut.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp Resmi</span>
                </div>
                <div className="mt-1 text-xs font-extrabold text-slate-800">+62 811-2345-6789</div>
                <div className="text-[10px] text-slate-500">Fast response 07:30–16:00 WIB</div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Mail className="h-4 w-4 text-[#163b8c]" />
                  <span>Email Panitia</span>
                </div>
                <div className="mt-1 text-xs font-extrabold text-slate-800 truncate">
                  sanggah@smartschool.sch.id
                </div>
                <div className="text-[10px] text-slate-500">Kirim bukti berkas pendukung</div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  <span>Masa Sanggah</span>
                </div>
                <div className="mt-1 text-xs font-extrabold text-slate-800">2×24 Jam Kerja</div>
                <div className="text-[10px] text-slate-500">Sejak tanggal pengumuman</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

