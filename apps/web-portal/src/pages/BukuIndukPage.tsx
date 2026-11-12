import { Printer, Search, Upload, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input, Select } from '../components/atoms';
import {
  BukuIndukDetailTabs,
  BukuIndukProfileRail,
  PortalTopbar,
} from '../components/organisms';
import { useAppDispatch, useAppSelector } from '../store';
import {
  BUKU_INDUK_RECORDS,
  setBukuIndukClassFilter,
  setBukuIndukSearch,
  setBukuIndukStatusFilter,
} from '../store/slices/portalSlice';

export function BukuIndukPage() {
  const dispatch = useAppDispatch();
  const { bukuIndukSearch, bukuIndukClassFilter, bukuIndukStatusFilter } = useAppSelector(
    (s) => s.portal,
  );

  const q = bukuIndukSearch.trim().toLowerCase();
  const selectedStudent =
    BUKU_INDUK_RECORDS.find(
      (st) =>
        (!q ||
          st.nisn.includes(q) ||
          st.nis.includes(q) ||
          st.fullName.toLowerCase().includes(q)) &&
        (bukuIndukClassFilter === 'ALL' || st.className === bukuIndukClassFilter) &&
        (bukuIndukStatusFilter === 'ALL' || st.status === bukuIndukStatusFilter),
    ) ?? BUKU_INDUK_RECORDS[0];

  return (
    <div className="space-y-5">
      <PortalTopbar
        breadcrumbs="ADMINISTRASI & TU / MASTER SISWA / BUKU INDUK DIGITAL"
        title="Buku Induk Digital 360° & Master Siswa"
        subtitle="Single Source of Truth (SSOT) data kependudukan standar Dapodik/EMIS, riwayat akademik kurikulum merdeka, dan brankas legalitas terintegrasi."
        rightSlot={
          <>
            <Link to="/siakad">
              <Button variant="outline" size="sm" leftIcon={<Upload className="h-3.5 w-3.5" />}>
                Impor Dapodik
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="h-3.5 w-3.5" />}
              onClick={() => window.print()}
            >
              Cetak Buku Induk
            </Button>
            <Link to="/ppdb-admin">
              <Button variant="primary" size="sm" leftIcon={<UserPlus className="h-3.5 w-3.5" />}>
                Tambah Siswa
              </Button>
            </Link>
          </>
        }
      />

      {/* Search & Filter Toolbar matching Screenshot 3 */}
      <Card padding="sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <Input
              value={bukuIndukSearch}
              onChange={(e) => dispatch(setBukuIndukSearch(e.target.value))}
              placeholder="Cari NISN, NIS, atau nama (misal: 0087462918 atau Aisyah)"
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="md:col-span-3">
            <Select
              value={bukuIndukClassFilter}
              onChange={(e) => dispatch(setBukuIndukClassFilter(e.target.value))}
            >
              <option value="ALL">Semua Rombel (2 Sampel Aktif)</option>
              <option value="Kelas XI MIPA 1">Kelas XI MIPA 1 (36 Siswa)</option>
              <option value="Kelas X-A">Kelas X-A (36 Siswa)</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Select
              value={bukuIndukStatusFilter}
              onChange={(e) => dispatch(setBukuIndukStatusFilter(e.target.value))}
            >
              <option value="Aktif">Status: Aktif</option>
              <option value="ALL">Semua Status</option>
            </Select>
          </div>
          <div className="md:col-span-2 flex justify-start md:justify-end">
            <Badge tone="emerald">● Dapodik Kemendikbud: Sync</Badge>
          </div>
        </div>
      </Card>

      {/* 4 + 8 Split matching Screenshot 3 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-4">
          <BukuIndukProfileRail student={selectedStudent} />
        </div>
        <div className="lg:col-span-8">
          <BukuIndukDetailTabs student={selectedStudent} />
        </div>
      </div>
    </div>
  );
}

