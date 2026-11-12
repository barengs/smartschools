import { FormEvent, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, QrCode, ShieldCheck, UserCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearAuthError, loginUser, setRememberSession } from '../../store/slices/authSlice';
import { Alert, Badge, Button, Card, Input } from '../atoms';
import { FormField } from '../molecules';

export function LoginFormPanel() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, rememberSession } = useAppSelector((s) => s.auth);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [instantHint, setInstantHint] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setInstantHint(null);
    const result = await dispatch(
      loginUser({ identifier: identifier.trim(), password, rememberSession }),
    );
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  }

  return (
    <Card padding="lg" className="shadow-xl shadow-slate-900/5 border-slate-200">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge tone="blue" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
          Otorisasi Otomatis RBAC
        </Badge>
        <span className="text-[11px] font-semibold text-slate-500">Protokol OAuth2 &amp; OIDC</span>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Satu akun resmi untuk seluruh akses layanan akademik, kesiswaan, dan keuangan.
        </p>
      </div>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}
      {instantHint && (
        <Alert tone="info" className="mt-4">
          {instantHint}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField
          label="Nomor Identitas Terdaftar"
          hint="Gunakan NISN (Siswa), NIP/NUPTK (Guru/Tendik), Username, atau Email Terdaftar."
        >
          <Input
            type="text"
            value={identifier}
            onChange={(e) => {
              if (error) dispatch(clearAuthError());
              setIdentifier(e.target.value);
            }}
            placeholder="Masukkan NISN, NIP, superadmin, atau Email"
            leftIcon={<UserCheck className="h-4 w-4" />}
            required
          />
        </FormField>

        <FormField
          label="Kata Sandi"
          rightSlot={
            <button
              type="button"
              onClick={() =>
                setInstantHint('Hubungi Helpdesk TU (helpdesk@smartschool.sch.id) untuk reset sandi SSO.')
              }
              className="text-xs font-bold text-[#163b8c] hover:underline cursor-pointer"
            >
              Lupa Kata Sandi?
            </button>
          }
        >
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              if (error) dispatch(clearAuthError());
              setPassword(e.target.value);
            }}
            placeholder="Masukkan kata sandi"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Toggle sandi"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
          />
        </FormField>

        <div className="flex items-center justify-between gap-2 text-xs">
          <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberSession}
              onChange={(e) => dispatch(setRememberSession(e.target.checked))}
              className="h-4 w-4 rounded border-slate-300 text-[#163b8c] focus:ring-blue-500"
            />
            <span>Ingat sesi ini selama 30 hari</span>
          </label>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Sesi aman 2FA
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {loading ? 'Memverifikasi SSO...' : 'Masuk Sekarang'}
        </Button>
      </form>

      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
          ATAU MASUK DENGAN METODE INSTAN
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={() =>
            setInstantHint(
              'OAuth2 Belajar.id / Google Workspace disiapkan via gateway SSO sekolah pada deployment produksi.',
            )
          }
        >
          Akun Belajar.id / Google
        </Button>
        <Button
          variant="outline"
          size="md"
          leftIcon={<QrCode className="h-4 w-4 text-[#163b8c]" />}
          onClick={() =>
            setInstantHint(
              'Tempelkan Kartu Pelajar RFID pada reader Kiosk atau pindai Dynamic QR melalui Student App.',
            )
          }
        >
          Tap Card / Scan QR
        </Button>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
        <div>
          Belum punya akun?{' '}
          <Link to="/ppdb" className="font-bold text-[#163b8c] hover:underline">
            Daftar E-PPDB 2026/2027 →
          </Link>
        </div>
        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>ISO 27001 Certified System</span>
        </div>
      </div>
    </Card>
  );
}

