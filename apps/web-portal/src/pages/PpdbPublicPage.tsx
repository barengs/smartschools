import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, apiRequest } from '../api/client';

interface PpdbRegisterResponse {
  applicationId: string;
  registrationNumber: string;
  verificationStatus: string;
  invoiceId: string | null;
}

export function PpdbPublicPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [admissionTrack, setAdmissionTrack] = useState('REGULER');
  const [previousSchool, setPreviousSchool] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [result, setResult] = useState<PpdbRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiRequest<PpdbRegisterResponse>(
        '/api/v1/core/ppdb/register',
        {
          method: 'POST',
          body: JSON.stringify({
            fullName,
            username,
            password,
            email: email || undefined,
            nisn: nisn || undefined,
            gender,
            admissionTrack,
            previousSchool: previousSchool || undefined,
            parentName,
            parentPhone,
            ppdbFeeAmount: 150000,
          }),
        },
        false,
      );
      setResult(res);
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal mendaftar PPDB');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="public-page">
      <div className="public-card">
        <div className="top-bar">
          <div>
            <div className="badge-pill">Portal Penerimaan Siswa Baru</div>
            <h1>Formulir E-PPDB Online</h1>
          </div>
          <Link to="/login" className="btn-secondary">
            Login SSO →
          </Link>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {result ? (
          <div className="alert-success">
            <h3>Pendaftaran Berhasil!</h3>
            <p>
              Nomor Pendaftaran Anda: <strong>{result.registrationNumber}</strong>
            </p>
            <p>
              Status: <strong>{result.verificationStatus}</strong>
            </p>
            <p>
              Silakan <Link to="/login">Login SSO</Link> menggunakan username{' '}
              <code>{username}</code> untuk mengunggah berkas persyaratan.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              <span>Nama Lengkap Calon Siswa *</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
            <label>
              <span>Username Akun Siswa *</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={4}
                required
              />
            </label>
            <label>
              <span>Kata Sandi Akun *</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </label>
            <label>
              <span>Email (Opsional)</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              <span>NISN (Opsional)</span>
              <input value={nisn} onChange={(e) => setNisn(e.target.value)} />
            </label>
            <label>
              <span>Jenis Kelamin *</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
              >
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            </label>
            <label>
              <span>Jalur Pendaftaran *</span>
              <select
                value={admissionTrack}
                onChange={(e) => setAdmissionTrack(e.target.value)}
              >
                <option value="REGULER">Reguler</option>
                <option value="ZONASI">Zonasi</option>
                <option value="PRESTASI">Prestasi</option>
                <option value="AFIRMASI">Afirmasi</option>
                <option value="MUTASI">Mutasi</option>
              </select>
            </label>
            <label>
              <span>Asal Sekolah</span>
              <input
                value={previousSchool}
                onChange={(e) => setPreviousSchool(e.target.value)}
              />
            </label>
            <label>
              <span>Nama Orang Tua / Wali *</span>
              <input
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                required
              />
            </label>
            <label>
              <span>No. HP / WhatsApp Orang Tua *</span>
              <input
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                required
              />
            </label>
            <div className="full-span">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran E-PPDB'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

