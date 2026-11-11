import { FormEvent, useEffect, useState } from 'react';
import { ApiError, apiRequest } from '../api/client';

interface Invoice {
  id: string;
  invoice_number: string;
  student_name: string;
  nis: string | null;
  billing_type: string;
  amount: string;
  due_date: string;
  status: string;
  va_number: string | null;
}

interface Summary {
  totals: {
    total_billed: string;
    total_paid: string;
    total_unpaid: string;
    invoice_count: string;
  };
}

function formatRupiah(val: string | number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val));
}

export function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [amount, setAmount] = useState(500000);
  const [dueDate, setDueDate] = useState('2026-12-10');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [inv, sum] = await Promise.all([
        apiRequest<Invoice[]>('/api/v1/core/finance/invoices'),
        apiRequest<Summary>('/api/v1/core/finance/summary'),
      ]);
      setInvoices(inv);
      setSummary(sum);
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal memuat data keuangan');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function generateBulkSpp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const res = await apiRequest<{ generatedCount: number }>(
        '/api/v1/core/finance/invoices/bulk-spp',
        {
          method: 'POST',
          body: JSON.stringify({ amount: Number(amount), dueDate }),
        },
      );
      setMessage(`Berhasil menerbitkan ${res.generatedCount} tagihan SPP`);
      await load();
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal menerbitkan tagihan SPP');
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>E-Finance &amp; Tagihan Sekolah</h1>
          <p className="muted">Penerbitan tagihan SPP massal, Virtual Account, dan rekonsiliasi.</p>
        </div>
      </header>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      {summary && (
        <div className="card-grid" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="muted">Total Tagihan</div>
            <h3>{formatRupiah(summary.totals.total_billed)}</h3>
          </div>
          <div className="card">
            <div className="muted">Sudah Terbayar</div>
            <h3>{formatRupiah(summary.totals.total_paid)}</h3>
          </div>
          <div className="card">
            <div className="muted">Belum Lunas</div>
            <h3>{formatRupiah(summary.totals.total_unpaid)}</h3>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Terbitkan Tagihan SPP Massal (Semua Siswa Aktif)</h3>
        <form onSubmit={generateBulkSpp} className="inline-form">
          <input
            type="number"
            min={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            Generate SPP Massal
          </button>
        </form>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>Siswa</th>
              <th>Jenis</th>
              <th>Nominal</th>
              <th>VA</th>
              <th>Jatuh Tempo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <code>{inv.invoice_number}</code>
                </td>
                <td>
                  <strong>{inv.student_name}</strong>
                  {inv.nis && <div className="muted">NIS: {inv.nis}</div>}
                </td>
                <td>{inv.billing_type}</td>
                <td>{formatRupiah(inv.amount)}</td>
                <td>
                  <code>{inv.va_number ?? '-'}</code>
                </td>
                <td>{inv.due_date}</td>
                <td>
                  <span className={inv.status === 'PAID' ? 'status-chip ok' : 'status-chip'}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

