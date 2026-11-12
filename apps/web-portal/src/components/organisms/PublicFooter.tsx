import { Clock, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../atoms';

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandLogo variant="dark" subtitle="AKREDITASI A UNGGUL" compact />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Sistem Manajemen Mutu Pendidikan Berstandar Nasional &amp; Terverifikasi Badan Akreditasi
              Nasional (BAN-P/SM).
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#163b8c]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Sinkronisasi Terpadu Dapodik &amp; EMIS</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Pusat Bantuan PPDB &amp; Helpdesk SSO
            </h4>
            <ul className="mt-3 space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>WhatsApp Hotline: +62 811-2345-6789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#163b8c] shrink-0" />
                <span>ppdb@smartschool.sch.id</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Jam Pelayanan Kampus
            </h4>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">Senin – Jumat</div>
                  <div>07:30 – 15:30 WIB (Sekretariat PPDB)</div>
                </div>
              </div>
              <div className="pl-6">
                <div className="font-bold text-slate-800">Sabtu</div>
                <div>08:00 – 12:00 WIB (Layanan Terpadu Satu Pintu)</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Infrastruktur Digital
            </h4>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Didukung arsitektur Cloud Single Sign-On (SSO) terpadu bagi Tenaga Pengajar, Siswa,
              dan Wali Murid.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Keamanan Data Terenkripsi SSL 256-Bit</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-6 text-[11px] text-slate-500">
          <p>
            © 2026 SmartSchool Integrated Ecosystem. Hak Cipta Dilindungi Undang-Undang. Terintegrasi
            Kemendikbudristek RI.
          </p>
          <div className="flex items-center gap-5 font-medium">
            <a href="#privasi" className="hover:text-slate-900">
              Kebijakan Privasi Data
            </a>
            <a href="#verifikasi" className="hover:text-slate-900">
              Panduan Verifikasi Berkas
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

