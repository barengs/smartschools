import React, { useState } from 'react';
import { Badge, BadgeTone, Card } from '../atoms';
import { StatCard } from '../molecules';

export interface WorkspaceKpi {
  label: string;
  value: string;
  sublabel: string;
  icon?: React.ReactNode;
}

export interface WorkspaceTabPanel {
  key: string;
  label: string;
  badge?: string;
  content: React.ReactNode;
}

interface ModuleWorkspaceShellProps {
  kpis: WorkspaceKpi[];
  tabs: WorkspaceTabPanel[];
  rightRail?: React.ReactNode;
  banner?: {
    tone: BadgeTone;
    tag: string;
    message: string;
  };
}

export function ModuleWorkspaceShell({
  kpis,
  tabs,
  rightRail,
  banner,
}: ModuleWorkspaceShellProps) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key ?? '');
  const currentTab = tabs.find((t) => t.key === activeKey) ?? tabs[0];

  return (
    <div className="space-y-6">
      {banner && (
        <div className="flex flex-wrap items-center gap-2.5 rounded border border-slate-200 bg-white px-4 py-3 text-xs shadow-2xs">
          <Badge tone={banner.tone} uppercase>
            {banner.tag}
          </Badge>
          <span className="font-semibold text-slate-700">{banner.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            sublabel={kpi.sublabel}
            icon={kpi.icon}
          />
        ))}
      </div>

      <div className={rightRail ? 'grid grid-cols-1 gap-6 lg:grid-cols-12 items-start' : ''}>
        <div className={rightRail ? 'lg:col-span-8 space-y-4' : 'space-y-4'}>
          <div className="flex flex-wrap items-center gap-1.5 rounded border border-slate-200 bg-white p-1.5 shadow-2xs">
            {tabs.map((tab) => {
              const active = tab.key === currentTab?.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveKey(tab.key)}
                  className={`inline-flex items-center gap-1.5 rounded px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#163b8c] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <Card padding="lg">{currentTab?.content}</Card>
        </div>

        {rightRail && <div className="lg:col-span-4 space-y-5">{rightRail}</div>}
      </div>
    </div>
  );
}

