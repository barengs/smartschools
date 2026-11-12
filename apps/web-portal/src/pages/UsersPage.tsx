import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-toastify';
import { Badge, Button, Card, Input, Select } from '../components/atoms';
import { DataTable } from '../components/molecules';
import { PortalTopbar } from '../components/organisms';
import { useAppDispatch, useAppSelector } from '../store';
import { createUserAccount, fetchUsersAndRoles, UserRow } from '../store/slices/usersSlice';

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

  useEffect(() => {
    if (message) toast.success(message);
  }, [message]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

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

  const columns = useMemo<ColumnDef<UserRow, unknown>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => <span className="font-bold text-[#212529]">{row.original.username}</span>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span className="text-[#495057]">{row.original.email ?? '-'}</span>,
      },
      {
        id: 'roles',
        header: 'Peran (RBAC)',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 flex-wrap">
            {row.original.roles.map((role) => (
              <Badge key={role} tone="blue">
                {role}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge tone={row.original.is_active ? 'emerald' : 'slate'}>
            {row.original.is_active ? 'Aktif' : 'Nonaktif'}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PortalTopbar
        title="Manajemen Pengguna & RBAC SSO"
        subtitle="Kelola identitas warga sekolah terpusat dengan otorisasi peran JWT RS256."
      />

      <Card padding="lg" className="space-y-4">
        <h2 className="text-base font-bold text-[#212529]">Tambah Akun Baru</h2>
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
        <DataTable data={users} columns={columns} emptyMessage="Belum ada data pengguna." />
      </Card>
    </div>
  );
}
