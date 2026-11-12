import { Clock, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../atoms';

export function PublicFooter() {
  return (
    <footer className="border-t border-[#dee2e6] bg-white text-[#495057]">
      <div className="bs-container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLogo variant="dark" subtitle="Akreditasi A Unggul" compact />
            <p className="mt-3 text-sm leading-relaxed text-[#6c757d]">
              Sistem Manajemen Mutu Pendidikan Berstandar Nasional &amp; Terintegrasi Dapodik dan EMIS.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a58ca]">
              <ShieldCheck className="h-4 w-4" />
              <span>Terverifikasi BAN-SM Nasional</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#212529]">Pusat Bantuan PPDB</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#6c757d]">
              <li className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#198754] shrink-0" />
                <span>WhatsApp: +62 811-2345-6789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#0d6efd] shrink-0" />
                <span>ppdb@smartschool.sch.id</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#212529]">Jam Pelayanan Kampus</h4>
            <div className="mt-3 space-y-2 text-sm text-[#6c757d]">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-[#6c757d] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#212529]">Senin – Jumat</div>
                  <div>07:30 – 15:30 WIB</div>
                </div>
              </div>
              <div className="pl-6">
                <div className="font-semibold text-[#212529]">Sabtu</div>
                <div>08:00 – 12:00 WIB</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#212529]">Keamanan &amp; Infrastruktur</h4>
            <p className="mt-3 text-sm leading-relaxed text-[#6c757d]">
              Didukung arsitektur Single Sign-On (SSO) bagi Tenaga Pengajar, Siswa, dan Wali Murid.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#198754]">
              <ShieldCheck className="h-4 w-4" />
              <span>Koneksi Terenkripsi TLS / RS256</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#dee2e6] pt-6 text-xs text-[#6c757d]">
          <p>&copy; 2026 SmartSchool Integrated Ecosystem. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-5">
            <a href="#biaya-ppdb" className="hover:text-[#0d6efd]">
              Rincian Biaya
            </a>
            <a href="#bantuan-ppdb" className="hover:text-[#0d6efd]">
              Hubungi Panitia
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
