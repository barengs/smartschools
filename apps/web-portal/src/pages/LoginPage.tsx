import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message ?? 'Gagal login SSO');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="badge-pill">Single Sign-On (JWT RS256)</div>
        <h1>Smart School Terintegrasi</h1>
        <p className="muted">
          Masuk dengan satu akun untuk mengakses SIAKAD, E-PPDB, LMS, dan Keuangan.
        </p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            <span>Username atau Email</span>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="superadmin atau email@sekolah.sch.id"
              required
            />
          </label>
          <label>
            <span>Kata Sandi</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
            />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Memverifikasi...' : 'Masuk ke Portal'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Calon siswa baru?</span>{' '}
          <Link to="/ppdb">Daftar E-PPDB Online →</Link>
        </div>
      </div>
    </div>
  );
}
