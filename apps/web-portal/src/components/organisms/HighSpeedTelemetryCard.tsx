import { Activity, Cpu, CreditCard, MonitorPlay } from 'lucide-react';
import { Badge, Card } from '../atoms';

export function HighSpeedTelemetryCard() {
  return (
    <Card padding="md" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-50 text-[#163b8c]">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              High-Speed Operations Live Throughput
            </h3>
            <p className="text-[11px] text-slate-500">
              SSOT Engine &amp; Rust IoT Pipeline Telemetry
            </p>
          </div>
        </div>
        <Badge tone="emerald">● Engine Health 99.98%</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            <span>LATENSI RFID GERBANG</span>
            <Cpu className="h-3.5 w-3.5 text-[#163b8c]" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            2.4 <span className="text-sm font-semibold text-slate-500">ms</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Broker Rust MQTT 0 Dropped</div>
          <div className="mt-3 h-2 w-full rounded-full bg-blue-100 overflow-hidden">
            <div className="h-full w-4/5 rounded-full bg-[#163b8c]" />
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            <span>CBT LIVE SESSIONS</span>
            <MonitorPlay className="h-3.5 w-3.5 text-[#163b8c]" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            1.042 <span className="text-xs font-semibold text-slate-500">Siswa Aktif</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Server Pod CPU: 14%</span>
            <span>RAM: 3.2 / 16 GB</span>
          </div>
          <div className="mt-2.5 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full w-1/4 rounded-full bg-emerald-600" />
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            <span>POS KANTIN CASHLESS</span>
            <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            18 <span className="text-sm font-semibold text-slate-500">tx / min</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            0% Double-Deduct Error
          </div>
          <div className="mt-3 flex items-end gap-1 h-4">
            {[40, 65, 55, 80, 95, 75].map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-xs bg-emerald-500/80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

