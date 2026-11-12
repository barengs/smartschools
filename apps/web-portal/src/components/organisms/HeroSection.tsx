import { ArrowRight, Building2, FileText, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { setFeeModalOpen } from '../../store/slices/ppdbPublicSlice';
import { Button } from '../atoms';

export function HeroSection() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const overview = useAppSelector((s) => s.ppdbPublic.overview);

  const schoolName = overview?.schoolName ?? 'SMA Negeri Nusantara Unggul';
  const npsn = overview?.npsn ?? '20108923';
  const activeStudents = overview?.metrics.activeStudents ?? 6;
  const totalRegisteredPpdb = overview?.metrics.totalRegisteredPpdb ?? 6;
  const remainingSeats = overview?.wave.remainingSeats ?? 236;

  return (
    <section className="bg-white border-b border-[#dee2e6] py-10 lg:py-14">
      <div className="bs-container">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left column — clean Bootstrap typography & hierarchy */}
          <div className="lg:col-span-7 min-w-0">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d6efd]">
              <Building2 className="h-4 w-4" />
              <span>
                NPSN {npsn} &middot; {schoolName}
              </span>
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#212529] leading-tight">
              Pendidikan Unggul, Berkarakter &amp; Sistem Sekolah Terintegrasi
            </h1>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#495057] max-w-2xl">
              Portal resmi layanan akademik, presensi siswa, pembelajaran Kurikulum Merdeka, dan
              penerimaan peserta didik baru (E-PPDB) berbasis Single Source of Truth (SSOT).
            </p>

            <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => navigate('/ppdb')}
              >
                Daftar PPDB Gelombang 1
              </Button>
              <Button
                variant="ghost"
                size="lg"
                leftIcon={<FileText className="h-4 w-4" />}
                onClick={() => dispatch(setFeeModalOpen(true))}
              >
                Lihat Rincian Biaya &amp; Syarat
              </Button>
            </div>

            {/* Clean Bootstrap bordered metric strip */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#dee2e6] rounded border border-[#dee2e6] bg-[#f8f9fa]">
              <div className="p-4">
                <div className="text-xs font-medium text-[#6c757d]">Akreditasi</div>
                <div className="mt-1 text-xl font-bold text-[#212529]">
                  {overview?.metrics.accreditation ?? 'A'} (Unggul)
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-medium text-[#6c757d]">Lulusan PTN</div>
                <div className="mt-1 text-xl font-bold text-[#212529] tabular-nums">
                  {overview?.metrics.alumniUniversityRate ?? '98.4%'}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-medium text-[#6c757d]">Siswa Aktif DB</div>
                <div className="mt-1 text-xl font-bold text-[#212529] tabular-nums">
                  {activeStudents} Siswa
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-medium text-[#6c757d]">Pendaftar PPDB</div>
                <div className="mt-1 text-xl font-bold text-[#0d6efd] tabular-nums">
                  {totalRegisteredPpdb} Berkas
                </div>
              </div>
            </div>
          </div>

          {/* Right column — authentic Bootstrap Card with real campus photo */}
          <div className="lg:col-span-5 min-w-0">
            <div className="overflow-hidden rounded border border-[#dee2e6] bg-white shadow-sm">
              <img
                src="/images/campus-hero.jpg"
                alt="Lingkungan kampus SMA Negeri Nusantara Unggul"
                className="aspect-16/10 w-full object-cover"
              />
              <div className="p-5">
                <h2 className="text-lg font-bold text-[#212529]">Lingkungan Belajar Terpadu</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[#495057]">
                  Pemantauan kehadiran siswa melalui gerbang RFID, pelaporan nilai transparan, serta
                  notifikasi wali murid terhubung langsung dalam satu sistem sekolah.
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-[#dee2e6] bg-[#f8f9fa] px-5 py-3 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#495057]">
                  <MapPin className="h-4 w-4 text-[#0d6efd]" />
                  Bogor, Jawa Barat
                </span>
                <span className="font-semibold text-[#198754] tabular-nums">
                  Sisa Kuota: {remainingSeats} Kursi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
