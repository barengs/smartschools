import { BookOpen, CalendarDays, CheckCircle2, ClipboardList, FileText, HelpCircle, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { JOURNAL_SESSIONS, setJournalSession } from '../../store/slices/portalSlice';
import { Badge, Card } from '../atoms';

export function JournalScheduleRail() {
  const dispatch = useAppDispatch();
  const activeSessionId = useAppSelector((s) => s.portal.journalActiveSessionId);

  return (
    <div className="space-y-5">
      {/* Jadwal Mengajar Hari Ini */}
      <Card padding="md" className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <CalendarDays className="h-4 w-4 text-[#163b8c]" />
            <span>Jadwal Mengajar Hari Ini</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500">4 SESI</span>
        </div>

        <div className="space-y-2.5">
          {JOURNAL_SESSIONS.map((ses) => {
            const isSelected = ses.id === activeSessionId;
            return (
              <button
                key={ses.id}
                type="button"
                onClick={() => dispatch(setJournalSession(ses.id))}
                className={`w-full rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#163b8c] bg-blue-50/70 ring-1 ring-[#163b8c]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                    {ses.timeRange}
                  </span>
                  <Badge
                    tone={
                      ses.status === 'ACTIVE'
                        ? 'blue'
                        : ses.status === 'COMPLETED'
                          ? 'emerald'
                          : ses.status === 'PIKET'
                            ? 'amber'
                            : 'slate'
                    }
                  >
                    {ses.status === 'ACTIVE'
                      ? 'Sedang Berjalan'
                      : ses.status === 'COMPLETED'
                        ? 'Selesai'
                        : ses.status === 'PIKET'
                          ? 'Jadwal Piket'
                          : 'Mendatang'}
                  </Badge>
                </div>
                <div className="mt-1 text-xs sm:text-sm font-extrabold text-slate-900">
                  {ses.subject}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-600">{ses.room}</div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>{ses.summary}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Rujukan Kurikulum & Capaian */}
      <Card padding="md" className="space-y-3.5">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
          <BookOpen className="h-4 w-4 text-[#163b8c]" />
          <span>Rujukan Kurikulum &amp; Capaian</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                STRUKTUR KURIKULUM
              </span>
              <Badge tone="blue">Fase F (Kelas XI)</Badge>
            </div>
            <div className="mt-1 font-extrabold text-slate-900">Kurikulum Merdeka</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              TARGET CAPAIAN PEMBELAJARAN (TP AKTIF)
            </div>
            <div className="mt-1 font-extrabold text-slate-900 leading-snug">
              TP 3.2 - Menganalisis Hukum Termodinamika dan Penerapannya pada Siklus Mesin Kalor
            </div>
            <div className="mt-1.5 text-[11px] text-slate-500">
              • Sesuai Silabus Alur Tujuan Pembelajaran (ATP)
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                Status Piket KBM
              </div>
              <div className="font-bold text-slate-900">Siaga Mandiri</div>
            </div>
            <Badge tone="emerald">Aktif 100%</Badge>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-600">
            <Radio className="h-4 w-4 text-[#163b8c] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800">Gerbang Tap RFID &amp; Wifi Lab</div>
              <div>Terhubung dengan 36 Presensi Sensor Siswa</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tautan Cepat Guru */}
      <Card padding="md" className="space-y-3">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          TAUTAN CEPAT GURU
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
          <Link
            to="/smart-lms"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-[#163b8c]"
          >
            <FileText className="h-3.5 w-3.5 text-[#163b8c]" />
            <span>Modul Ajar</span>
          </Link>
          <Link
            to="/bank-soal-cbt"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-[#163b8c]"
          >
            <ClipboardList className="h-3.5 w-3.5 text-[#163b8c]" />
            <span>Kuis CBT</span>
          </Link>
          <Link
            to="/e-rapor"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-[#163b8c]"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Rubrik &amp; Rapor</span>
          </Link>
          <Link
            to="/kesiswaan"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-[#163b8c]"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
            <span>Rujuk E-BK</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}

