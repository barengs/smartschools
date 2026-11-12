import {
  CheckCircle2,
  CreditCard,
  FileUp,
  LocateFixed,
  MapPin,
  Printer,
  School,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  AdmissionTrack,
  markChecklistUploaded,
  PpdbDraftForm,
  SCHOOL_GATE_COORDS,
  setWizardStep,
  updateDraftField,
} from '../../store/slices/ppdbPublicSlice';
import { Alert, Badge, Button, Card, Input, Select } from '../atoms';
import { FormField, MapboxGeotagMap } from '../molecules';

interface PpdbWizardStepContentProps {
  onFinalSubmit: () => void;
}

export function PpdbWizardStepContent({ onFinalSubmit }: PpdbWizardStepContentProps) {
  const dispatch = useAppDispatch();
  const { currentStep, draft, checklist, distanceMeters, submitting, submitError, submitResult } =
    useAppSelector((s) => s.ppdbPublic);

  function setField<K extends keyof PpdbDraftForm>(key: K, value: PpdbDraftForm[K]) {
    dispatch(updateDraftField({ key, value }));
  }

  function handleUseGps() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setField('latitude', pos.coords.latitude.toFixed(6));
          setField('longitude', pos.coords.longitude.toFixed(6));
        },
        () => {
          setField('latitude', '-6.602148');
          setField('longitude', '106.814321');
        },
      );
    }
  }

  return (
    <div className="space-y-5">
      {submitError && (
        <Alert tone="error" title="Gagal Mengirim Pendaftaran">
          {submitError}
        </Alert>
      )}

      {/* Jalur banner matching screenshot 4 */}
      <Card padding="sm" className="bg-blue-50/70 border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-blue-200 text-[#163b8c]">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#163b8c]">
                JALUR PILIHAN UTAMA
              </span>
              <Badge tone="emerald">Tervalidasi Disdukcapil</Badge>
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
              Jalur {draft.admissionTrack} (Radius Maksimal 1.500m)
            </div>
            <p className="text-xs text-slate-600">
              Penentuan kelulusan berbasis radius jarak koordinat GPS tempat tinggal ke gerbang
              resmi sekolah.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(setWizardStep(1))}
        >
          Ganti Jalur
        </Button>
      </Card>

      {currentStep === 1 && (
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#163b8c]" />
              <h2 className="text-base font-extrabold text-slate-900">
                Langkah 1: Akun SSO, Jalur Seleksi &amp; Data Diri Siswa
              </h2>
            </div>
            <Badge tone="blue">SSO RS256 Terpadu</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Jalur Pendaftaran" required>
              <Select
                value={draft.admissionTrack}
                onChange={(e) => setField('admissionTrack', e.target.value as AdmissionTrack)}
              >
                <option value="ZONASI">Jalur Zonasi Domisili</option>
                <option value="PRESTASI">Jalur Prestasi Akademik/Non-Akademik</option>
                <option value="AFIRMASI">Jalur Afirmasi KIP/PKH</option>
                <option value="MUTASI">Jalur Mutasi / Anak Guru</option>
                <option value="REGULER">Jalur Reguler Mandiri</option>
              </Select>
            </FormField>

            <FormField label="Jenis Kelamin" required>
              <Select
                value={draft.gender}
                onChange={(e) => setField('gender', e.target.value as 'MALE' | 'FEMALE')}
              >
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </Select>
            </FormField>

            <FormField label="Nama Lengkap Calon Siswa" required>
              <Input
                value={draft.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                placeholder="Nama sesuai Akta & Ijazah"
                required
              />
            </FormField>

            <FormField label="Nomor Induk Siswa Nasional (NISN)">
              <Input
                value={draft.nisn}
                onChange={(e) => setField('nisn', e.target.value)}
                placeholder="10 digit NISN"
              />
            </FormField>

            <FormField label="Nomor Induk Kependudukan (NIK)">
              <Input
                value={draft.nik}
                onChange={(e) => setField('nik', e.target.value)}
                placeholder="16 digit NIK sesuai KK"
              />
            </FormField>

            <FormField label="Email Aktif (Opsional)">
              <Input
                type="email"
                value={draft.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="nama@email.com"
              />
            </FormField>

            <FormField label="Username Akun SSO Siswa" required hint="Minimal 4 karakter tanpa spasi">
              <Input
                value={draft.username}
                onChange={(e) => setField('username', e.target.value)}
                placeholder="misal: aisyah2026"
                required
              />
            </FormField>

            <FormField label="Kata Sandi Akun SSO" required hint="Minimal 8 karakter">
              <Input
                type="password"
                value={draft.password}
                onChange={(e) => setField('password', e.target.value)}
                placeholder="Minimal 8 karakter"
                required
              />
            </FormField>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <div className="space-y-5">
          {/* 1. Pilihan Satuan Pendidikan */}
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <School className="h-5 w-5 text-[#163b8c]" />
              <h2 className="text-base font-extrabold text-slate-900">
                1. Pilihan Satuan Pendidikan (SMA Negeri / Swasta)
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Sekolah Pilihan 1 (Utama)"
                required
                rightSlot={<span className="font-semibold text-[#163b8c]">Kuota Sisa: 240 Kursi</span>}
                hint="Titik acuan: Pintu Gerbang Utama Selatan Jl. Pajajaran No. 42"
              >
                <Select
                  value={draft.primarySchool}
                  onChange={(e) => setField('primarySchool', e.target.value)}
                >
                  <option value="SMA Nusantara Unggul (NPSN: 20108923) — Rutin">
                    SMA Nusantara Unggul (NPSN: 20108923) — Rutin
                  </option>
                  <option value="SMK Teknologi Mandiri (NPSN: 20108991) — Vokasi">
                    SMK Teknologi Mandiri (NPSN: 20108991) — Vokasi
                  </option>
                </Select>
              </FormField>

              <FormField
                label="Sekolah Pilihan 2 (Alternatif)"
                rightSlot={<span>Opsional Zonasi</span>}
                hint="Sebagai cadangan seleksi jika gagal di pilihan utama terpenuhi"
              >
                <Select
                  value={draft.secondarySchool}
                  onChange={(e) => setField('secondarySchool', e.target.value)}
                >
                  <option value="SMA Negeri 3 Kota Madya (NPSN: 20108840)">
                    SMA Negeri 3 Kota Madya (NPSN: 20108840)
                  </option>
                  <option value="Tidak Memilih Pilihan Kedua">Tidak Memilih Pilihan Kedua</option>
                </Select>
              </FormField>
            </div>
          </Card>

          {/* 2. Penentuan Titik Koordinat Rumah (Geotagging Presisi) */}
          <Card padding="lg" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#163b8c]" />
                  <span>2. Penentuan Titik Koordinat Rumah (Geotagging Presisi)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Posisikan pin titik tepat pada gerbang pintu utama rumah tinggal sesuai domisili
                  Kartu Keluarga (KK). Pengukuran dihitung otomatis dengan algoritma Haversine
                  Formula Spherical Distance.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<LocateFixed className="h-3.5 w-3.5" />}
                onClick={handleUseGps}
                className="shrink-0"
              >
                Gunakan Lokasi GPS Saat Ini
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Latitude Garis Lintang"
                rightSlot={
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Terkunci Akurat
                  </span>
                }
              >
                <Input
                  value={draft.latitude}
                  onChange={(e) => setField('latitude', e.target.value)}
                  leftIcon={<span className="text-[10px] font-extrabold">LAT</span>}
                  className="tabular-nums font-bold"
                />
              </FormField>

              <FormField
                label="Longitude Garis Bujur"
                rightSlot={
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Terkunci Akurat
                  </span>
                }
              >
                <Input
                  value={draft.longitude}
                  onChange={(e) => setField('longitude', e.target.value)}
                  leftIcon={<span className="text-[10px] font-extrabold">LNG</span>}
                  className="tabular-nums font-bold"
                />
              </FormField>
            </div>

            {/* Interactive Mapbox GL JS map */}
            <MapboxGeotagMap
              schoolLat={SCHOOL_GATE_COORDS.lat}
              schoolLng={SCHOOL_GATE_COORDS.lng}
              studentLat={
                draft.latitude.trim() && Number.isFinite(Number(draft.latitude))
                  ? Number(draft.latitude)
                  : null
              }
              studentLng={
                draft.longitude.trim() && Number.isFinite(Number(draft.longitude))
                  ? Number(draft.longitude)
                  : null
              }
              onSelectLocation={(lat, lng) => {
                setField('latitude', lat);
                setField('longitude', lng);
              }}
            />

            {/* Haversine Distance Result Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-[#dee2e6] bg-[#f8f9fa] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-[#0d6efd] text-white shrink-0 font-bold text-xs">
                  GPS
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#495057]">
                      Hasil Perhitungan Haversine
                    </span>
                    {distanceMeters > 0 ? (
                      <Badge tone={distanceMeters <= 1500 ? 'emerald' : 'amber'}>
                        {distanceMeters <= 1500 ? 'Dalam Radius Zonasi' : 'Di Luar Radius 1.500m'}
                      </Badge>
                    ) : (
                      <Badge tone="slate">Belum Ada Koordinat</Badge>
                    )}
                  </div>
                  <div className="text-lg font-bold text-[#212529] tabular-nums">
                    {distanceMeters > 0
                      ? `${distanceMeters} Meter dari Gerbang Sekolah`
                      : 'Klik peta Mapbox atau tekan tombol GPS'}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Alamat Domisili Kependudukan */}
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 flex-wrap">
              <h2 className="text-base font-extrabold text-slate-900">
                3. Alamat Domisili Kependudukan (Sesuai Kartu Keluarga)
              </h2>
              <Badge tone="emerald">Sinkron Disdukcapil RI</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              <FormField label="Alamat Jalan / Gang / Kompleks" required className="sm:col-span-4">
                <Input
                  value={draft.streetAddress}
                  onChange={(e) => setField('streetAddress', e.target.value)}
                />
              </FormField>
              <FormField label="RT" className="sm:col-span-1">
                <Input value={draft.rt} onChange={(e) => setField('rt', e.target.value)} />
              </FormField>
              <FormField label="RW" className="sm:col-span-1">
                <Input value={draft.rw} onChange={(e) => setField('rw', e.target.value)} />
              </FormField>

              <FormField label="Kelurahan / Desa" required className="sm:col-span-2">
                <Input value={draft.village} onChange={(e) => setField('village', e.target.value)} />
              </FormField>
              <FormField label="Kecamatan" required className="sm:col-span-2">
                <Input
                  value={draft.district}
                  onChange={(e) => setField('district', e.target.value)}
                />
              </FormField>
              <FormField label="Kota / Kabupaten" required className="sm:col-span-2">
                <Input value={draft.city} onChange={(e) => setField('city', e.target.value)} />
              </FormField>

              <FormField label="Kode Pos" required className="sm:col-span-2">
                <Input
                  value={draft.postalCode}
                  onChange={(e) => setField('postalCode', e.target.value)}
                />
              </FormField>

              <FormField label="Kepemilikan / Status Tempat Tinggal" required className="sm:col-span-4">
                <div className="grid grid-cols-3 gap-2 pt-1.5 text-xs">
                  {(
                    [
                      { key: 'OWN_PARENT', label: 'Rumah Pribadi Orang Tua' },
                      { key: 'GUARDIAN', label: 'Ikut Wali / Kakek Nenek' },
                      { key: 'RENT', label: 'Kontrak / Sewa' },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-2 rounded border px-2.5 py-2 cursor-pointer ${
                        draft.housingStatus === opt.key
                          ? 'border-[#163b8c] bg-blue-50 text-[#163b8c] font-bold'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="housingStatus"
                        checked={draft.housingStatus === opt.key}
                        onChange={() => setField('housingStatus', opt.key)}
                      />
                      <span className="leading-tight">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </FormField>
            </div>
          </Card>

          {/* 4. Data Sekolah Asal & Rekam Nilai */}
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 flex-wrap">
              <h2 className="text-base font-extrabold text-slate-900">
                4. Data Sekolah Asal (SMP / MTs) &amp; Rekam Nilai
              </h2>
              <Badge tone="blue">Dapodik Ready</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="NPSN SMP/MTs" required>
                <Input
                  value={draft.previousSchoolNpsn}
                  onChange={(e) => setField('previousSchoolNpsn', e.target.value)}
                  className="tabular-nums"
                />
              </FormField>
              <FormField label="Nama Resmi Sekolah Asal" required>
                <Input
                  value={draft.previousSchool}
                  onChange={(e) => setField('previousSchool', e.target.value)}
                />
              </FormField>
              <FormField label="Nomor SKL Sementara / Surat Keterangan Lulus" required>
                <Input
                  value={draft.sklNumber}
                  onChange={(e) => setField('sklNumber', e.target.value)}
                />
              </FormField>
              <FormField label="Rata-Rata Nilai Rapor (Sem 1–5)" required rightSlot={<span>Skala 100</span>}>
                <Input
                  value={draft.reportAverage}
                  onChange={(e) => setField('reportAverage', e.target.value)}
                  className="tabular-nums font-bold"
                  rightSlot={<span className="text-xs font-semibold text-slate-400">/ 100</span>}
                />
              </FormField>
            </div>
          </Card>
        </div>
      )}

      {currentStep === 3 && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-[#163b8c]" />
              <h2 className="text-base font-extrabold text-slate-900">
                Langkah 3: Brankas Berkas Persyaratan (MinIO S3 Presigned Upload)
              </h2>
            </div>
            <Badge tone="blue">Maks 2 MB / Berkas</Badge>
          </div>
          <p className="text-xs text-slate-600">
            Unggah pindaian dokumen asli. Berkas dapat langsung dilengkapi sekarang atau setelah akun
            SSO siswa aktif.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {checklist.map((doc) => (
              <div
                key={doc.code}
                className="rounded border border-slate-200 p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{doc.title}</span>
                    <Badge tone={doc.status === 'REQUIRED' ? 'rose' : 'emerald'}>
                      {doc.status === 'REQUIRED' ? 'Wajib' : 'Siap'}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{doc.fileName}</div>
                </div>
                {doc.code !== 'GEOTAG' && (
                  <label className="inline-flex cursor-pointer items-center justify-center rounded border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
                    <span>Pilih Berkas PDF / JPG</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          dispatch(
                            markChecklistUploaded({
                              code: doc.code,
                              fileName: `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`,
                            }),
                          );
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {currentStep === 4 && (
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#163b8c]" />
              <h2 className="text-base font-extrabold text-slate-900">
                Langkah 4: Kontak Orang Tua / Wali &amp; Pembayaran Formulir (VA/QRIS)
              </h2>
            </div>
            <Badge tone="emerald">Rp150.000</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Lengkap Orang Tua / Wali" required>
              <Input
                value={draft.parentName}
                onChange={(e) => setField('parentName', e.target.value)}
                placeholder="Nama Ayah / Ibu / Wali"
                required
              />
            </FormField>
            <FormField label="No. HP / WhatsApp Orang Tua" required hint="Notifikasi VA & kelulusan dikirim via WhatsApp">
              <Input
                value={draft.parentPhone}
                onChange={(e) => setField('parentPhone', e.target.value)}
                placeholder="0812xxxxxxxx"
                required
              />
            </FormField>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Kanal Pembayaran Otomatis E-Finance
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  { id: 'VA_BNI', title: 'Virtual Account BNI / BRI', desc: 'Verifikasi HMAC instan' },
                  { id: 'QRIS', title: 'QRIS Dinamis Nasional', desc: 'Semua e-Wallet & mobile banking' },
                  { id: 'VA_MANDIRI', title: 'Virtual Account Mandiri', desc: 'Mendukung cicilan biaya' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setField('paymentMethod', m.id)}
                  className={`rounded border p-3.5 text-left transition-colors cursor-pointer ${
                    draft.paymentMethod === m.id
                      ? 'border-[#163b8c] bg-blue-50 text-[#163b8c]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-extrabold">{m.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="lg"
              loading={submitting}
              onClick={onFinalSubmit}
            >
              {submitting ? 'Memproses Pendaftaran ke Core ERP...' : 'Konfirmasi & Kirim Pendaftaran'}
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 5 && (
        <Card padding="lg" className="space-y-4">
          {submitResult ? (
            <Alert tone="success" title="Pendaftaran E-PPDB Berhasil Terekam di Core ERP!">
              <div className="space-y-1.5 mt-1">
                <div>
                  Nomor Pendaftaran: <strong className="tabular-nums">{submitResult.registrationNumber}</strong>
                </div>
                <div>
                  Status Verifikasi Awal: <strong>{submitResult.verificationStatus}</strong>
                </div>
                {submitResult.invoiceId && (
                  <div>
                    ID Tagihan VA/QRIS: <code>{submitResult.invoiceId}</code>
                  </div>
                )}
                <p className="pt-1">
                  Silakan{' '}
                  <Link to="/login" className="font-bold underline text-emerald-900">
                    Login SSO
                  </Link>{' '}
                  menggunakan username <code>{draft.username}</code> untuk mengunggah berkas ke
                  MinIO dan mencetak kartu ujian.
                </p>
              </div>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#163b8c]" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    Langkah 5: Ringkasan Akhir &amp; Cetak Kartu Peserta
                  </h2>
                </div>
                <Badge tone="amber">Belum Dikirim ke Server</Badge>
              </div>
              <p className="text-xs text-slate-600">
                Pastikan Username Akun SSO (Langkah 1), Kontak Orang Tua (Langkah 4), dan titik
                zonasi ({distanceMeters} meter) sudah terisi benar sebelum menekan tombol kirim.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="md" loading={submitting} onClick={onFinalSubmit}>
                  Kirim Pendaftaran Sekarang
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<Printer className="h-4 w-4" />}
                  onClick={() => window.print()}
                >
                  Cetak Ringkasan Draf
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

