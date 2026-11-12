import { FormEvent, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Input, Select } from '../components/atoms';
import { PortalTopbar } from '../components/organisms';
import { useAppDispatch, useAppSelector } from '../store';
import { createUserAccount, fetchUsersAndRoles } from '../store/slices/usersSlice';

export function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, roles, message, error } = useAppSelector((s) => s.users);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleCode, setRoleCode] = useState('GURU');

  useEffect(() => {
    dispatch(fetchUsersAndRoles());
  }, [dispatch]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const res = await dispatch(
      createUserAccount({
        username,
        email: email || undefined,
        password,
        roleCode,
      }),
    );
    if (createUserAccount.fulfilled.match(res)) {
      setUsername('');
      setEmail('');
      setPassword('');
    }
  }

  return (
    <div className="space-y-6">
      <PortalTopbar
        title="Manajemen Pengguna & RBAC SSO"
        subtitle="Kelola identitas warga sekolah terpusat dengan otorisasi peran JWT RS256."
      />

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card padding="lg" className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">Tambah Akun Baru</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email (opsional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password (min 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <Select value={roleCode} onChange={(e) => setRoleCode(e.target.value)}>
            {roles.map((r) => (
              <option key={r.id} value={r.code}>
                {r.name} ({r.code})
              </option>
            ))}
          </Select>
          <Button type="submit" variant="primary" size="md">
            Tambah User
          </Button>
        </form>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Peran (RBAC)</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-bold text-slate-900">{u.username}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {u.roles.map((role) => (
                        <Badge key={role} tone="blue">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.is_active ? 'emerald' : 'slate'}>
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
