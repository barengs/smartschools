import { useEffect } from 'react';
import { Download, HelpCircle, Mail, MessageSquare, Share2 } from 'lucide-react';
import { Badge, Button, Card } from '../components/atoms';
import {
  ReEnrollmentGuide,
  SelectionLookupCard,
  SelectionRecapSection,
  SelectionResultSection,
} from '../components/organisms';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPublicSelectionResults } from '../store/slices/ppdbPublicSlice';

export function SelectionStatusPage() {
  const dispatch = useAppDispatch();
  const { lookupQuery, lookupTrack, recapTab, recapSearch, recapPage } = useAppSelector(
    (s) => s.ppdbPublic,
  );

  useEffect(() => {
    dispatch(
      fetchPublicSelectionResults({
        q: recapSearch,
        highlight: lookupQuery,
        track: lookupTrack,
        tab: recapTab,
        page: recapPage,
        pageSize: 6,
      }),
    );
  }, [dispatch, recapTab, recapSearch, recapPage]);

  return (
    <div className="bs-container py-8 lg:py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#dee2e6] pb-6">
        <div className="max-w-3xl">
          <Badge tone="emerald">Pengumuman Resmi Hasil Seleksi E-PPDB TA 2026/2027</Badge>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#212529]">
            Pengumuman Hasil Akhir Seleksi E-PPDB
          </h1>
          <p className="mt-2 text-base text-[#495057]">
            Masukkan Nomor Registrasi PPDB atau NISN calon peserta didik untuk memeriksa hasil
            seleksi secara langsung dari basis data panitia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('rekap-seleksi')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Statistik Kelulusan
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Share2 className="h-4 w-4" />}
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
          >
            Salin Tautan
          </Button>
        </div>
      </div>

      <SelectionLookupCard />
      <SelectionResultSection />
      <ReEnrollmentGuide />
      <div id="rekap-seleksi">
        <SelectionRecapSection />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card padding="none" className="lg:col-span-5 overflow-hidden">
          <div className="bg-[#0d6efd] p-6 text-white">
            <span className="inline-block rounded bg-white/20 px-2.5 py-1 text-xs font-semibold">
              Layanan Konsultasi Kampus
            </span>
            <h3 className="mt-3 text-lg font-bold">Sekretariat Panitia PPDB</h3>
            <p className="mt-1 text-sm text-blue-100">
              Gedung Pusat Administrasi Lt. 1, Ruang Pelayanan Terpadu Satu Pintu
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 p-4 bg-white">
            <div>
              <div className="text-sm font-bold text-[#212529]">SK Penetapan Kelulusan</div>
              <div className="text-xs text-[#6c757d]">Dokumen Pengumuman Resmi (PDF)</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => window.print()}
            >
              Cetak SK
            </Button>
          </div>
        </Card>

        <Card padding="lg" className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0d6efd]">
              <HelpCircle className="h-4 w-4" />
              <span>Masa Sanggah &amp; Klarifikasi</span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-[#212529]">
              Pusat Bantuan &amp; Klarifikasi Nilai
            </h3>
            <p className="mt-1.5 text-sm text-[#495057]">
              Jika terdapat ketidaksesuaian berkas rapor atau koordinat titik zonasi, silakan
              hubungi tim verifikator melalui saluran resmi berikut.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-md border border-[#dee2e6] bg-[#f8f9fa] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#212529]">
                  <MessageSquare className="h-4 w-4 text-[#198754]" />
                  <span>WhatsApp Resmi</span>
                </div>
                <div className="mt-1 text-sm font-bold text-[#212529]">+62 811-2345-6789</div>
                <div className="text-xs text-[#6c757d]">07:30–16:00 WIB</div>
              </div>
              <div className="rounded-md border border-[#dee2e6] bg-[#f8f9fa] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#212529]">
                  <Mail className="h-4 w-4 text-[#0d6efd]" />
                  <span>Email Panitia</span>
                </div>
                <div className="mt-1 text-sm font-bold text-[#212529] truncate">
                  ppdb@smartschool.sch.id
                </div>
                <div className="text-xs text-[#6c757d]">Respon 1x24 jam kerja</div>
              </div>
              <div className="rounded-md border border-[#dee2e6] bg-[#f8f9fa] p-3.5">
                <div className="text-xs font-semibold text-[#6c757d]">Nomor SK Panitia</div>
                <div className="mt-1 text-sm font-bold text-[#212529]">421/002-PPDB/2026</div>
                <div className="text-xs text-[#6c757d]">Terverifikasi Digital</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
