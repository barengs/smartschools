import {
  Calendar,
  ChevronRight,
  Download,
  MessageSquare,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Card } from '../atoms';
import { ProgressMeter } from '../molecules';

export function ExecutiveRightRail() {
  const [quickNotice, setQuickNotice] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Quick Actions */}
      <Card padding="md" className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
          <Zap className="h-4 w-4 text-[#163b8c]" />
          <span>Aksi Cepat Kepemimpinan</span>
        </div>

        {quickNotice && <Alert tone="info">{quickNotice}</Alert>}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() =>
              setQuickNotice('Antrean Broadcast WhatsApp wali murid disiapkan via BullMQ.')
            }
            className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-left hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">Broadcast WA</div>
                <div className="text-[11px] text-slate-500">
                  Pemberitahuan resmi via gateway resmi
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() =>
              setQuickNotice('Laporan eksekutif PDF/Excel bertanda tangan TTE BSrE sedang digenerate.')
            }
            className="flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50/60 px-3.5 py-2.5 text-left hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#163b8c] text-white shrink-0">
                <Download className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">Unduh Rekap</div>
                <div className="text-[11px] text-slate-500">
                  Laporan berkas PDF/Excel bertanda tangan TTE
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() =>
              setQuickNotice('Job rekalkulasi EWS Python Service C dipicu (model Scikit-learn v4.2).')
            }
            className="flex w-full items-center justify-between rounded-xl border border-rose-200 bg-rose-50/60 px-3.5 py-2.5 text-left hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white shrink-0">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">Hitung Ulang</div>
                <div className="text-[11px] text-slate-500">Kalkulasi ulang bobot risiko instan</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </Card>

      {/* Cashflow & Finance Card */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Arus Kas &amp; Finansial</h3>
            <p className="text-[11px] text-slate-500">Likuiditas Operasional Yayasan</p>
          </div>
          <Badge tone="emerald">Audit Sehat</Badge>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
          <div className="text-[11px] font-semibold text-slate-500">
            Total Saldo Likuid Terkonsolidasi
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
            Rp 1.849.200.000
          </div>
        </div>

        <div className="space-y-3.5">
          <ProgressMeter
            label="Iuran SPP Reguler"
            rightTop="94.2% (Rp 482,5 jt)"
            percentage={94.2}
            leftBottom="Target: Rp 512 jt"
            rightBottom="Sisa 32 Siswa"
            tone="blue"
          />
          <ProgressMeter
            label="Dana BOS Tahap II"
            rightTop="81.0% (Rp 640 jt)"
            percentage={81}
            leftBottom="Total Pagu: Rp 790 jt"
            rightBottom="Realisasi Sarpras OK"
            tone="teal"
          />
          <ProgressMeter
            label="Kas Kecil Imprest KBM"
            rightTop="42.5% (Rp 8,5 jt)"
            percentage={42.5}
            leftBottom="Plafon: Rp 20 jt"
            rightBottom="Aman terkendali"
            tone="emerald"
          />
        </div>
      </Card>

      {/* Agenda & Sidang */}
      <Card padding="md" className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Agenda &amp; Sidang</h3>
            <p className="text-[11px] text-slate-500">Milestone Akademik Kritis</p>
          </div>
          <Calendar className="h-4 w-4 text-[#163b8c]" />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
            <div className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-center shrink-0">
              <div className="text-[9px] font-extrabold text-[#163b8c]">H-12</div>
              <div className="text-xs font-extrabold text-slate-900 tabular-nums">05 Nov</div>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-slate-900">
                Sumatif Tengah Semester (STS 1)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sinkronisasi kisi-kisi Bank Soal CBT &amp; kuota server siap.
              </p>
              <div className="text-[11px] font-bold text-emerald-700 mt-1">
                ✓ 92% Soal Terverifikasi
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
            <div className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-center shrink-0">
              <div className="text-[9px] font-extrabold text-rose-700">H-4</div>
              <div className="text-xs font-extrabold text-slate-900 tabular-nums">28 Okt</div>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-slate-900">
                Rapat Evaluasi Disiplin &amp; EWS
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sidang pleno Kepala Sekolah, Wakasek Kesiswaan, &amp; Tim BK.
              </p>
              <div className="text-[11px] font-bold text-rose-700 mt-1">
                Ruang Rapat Utama • 13:30 WIB
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
            <div className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-center shrink-0">
              <div className="text-[9px] font-extrabold text-slate-600">H-19</div>
              <div className="text-xs font-extrabold text-slate-900 tabular-nums">12 Nov</div>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-slate-900">
                Audit Internal Kinerja Keuangan Yayasan
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Verifikasi kepatuhan BOS dan rekonsiliasi SPP Q3.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

