import { ChevronRight, Download, Headphones, MessageSquare, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../atoms';

export function BrochureHelpdeskSection() {
  return (
    <section id="biaya-ppdb" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="bantuan-ppdb">
        <Card variant="navy" padding="lg" className="overflow-hidden relative">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-200">
                SIAP MENJADI BAGIAN DARI GENERASI CERDAS?
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Unduh Brosur Lengkap Panduan PPDB &amp; Rincian Biaya TA 2026/2027
              </h2>
              <p className="mt-3 text-sm text-blue-100 leading-relaxed max-w-2xl">
                Dapatkan panduan komprehensif mengenai kurikulum penjurusan, kalender penerimaan,
                beasiswa prestasi/KIP, serta skema cicilan pembayaran tanpa bunga.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="/status-seleksi"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0f2b6b] shadow-sm hover:bg-blue-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh Brosur Resmi PDF (2.4 MB)</span>
                </a>
                <Link
                  to="/status-seleksi"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition-colors"
                >
                  <Headphones className="h-4 w-4" />
                  <span>Layanan Cek Status PPDB</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#163b8c]">
                    <Headphones className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold">Helpdesk Panitia</h3>
                    <p className="text-[11px] text-slate-500">
                      Butuh bantuan teknis pendaftaran atau validasi zonasi? Hubungi petugas kami.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  <a
                    href="https://wa.me/6281123456789"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">WhatsApp Center PPDB</div>
                        <div className="text-[11px] text-slate-500">+62 811-2345-6789</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </a>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <PhoneCall className="h-4 w-4 text-[#163b8c]" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Hotline Tata Usaha</div>
                        <div className="text-[11px] text-slate-500">(0251) 800-1234 (Ext. 101)</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#163b8c]">Jam Kerja</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

