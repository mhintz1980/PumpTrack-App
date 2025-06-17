import React from "react";
import type { LucideIcon } from 'lucide-react';

export interface KpiSubRow {
  label: string;
  value: string | number;
}

export interface KpiCardProps {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string | number;
  subRows?: KpiSubRow[];
}

const KpiCardComponent: React.FC<KpiCardProps> = ({
  id,
  icon,
  label,
  value,
  subRows,
}) => (
  <div
    className="w-48 rounded-lg bg-glass/30 backdrop-blur p-4 shadow-md border border-glass-border flex flex-col gap-2"
    id={id}
    data-testid={`kpi-card-${id}`}
  >
    <div className="flex items-center gap-2">
      <span className="text-2xl text-glass-accent-purple">
        {React.createElement(icon, { className: 'h-5 w-5' })}
      </span>
      <span className="text-base font-medium text-glass-text-primary">{label}</span>
    </div>
    <div className="text-2xl font-semibold text-glass-text-primary">{value}</div>
    {subRows && subRows.length > 0 && (
      <div className="flex flex-col gap-1 mt-2">
        {subRows.map((row, idx) => (
          <div
            key={idx}
            className="flex justify-between text-sm text-slate-300"
          >
            <span className="text-glass-text-muted">{row.label}</span>
            <span className="text-glass-text-primary">{row.value}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const KpiCard = React.memo(
  KpiCardComponent,
  (prev, next) => {
    if (
      prev.id !== next.id ||
      prev.label !== next.label ||
      prev.value !== next.value ||
      prev.icon !== next.icon
    ) {
      return false;
    }

    if (prev.subRows === next.subRows) {
      return true;
    }

    if (!prev.subRows || !next.subRows) {
      return false;
    }

    if (prev.subRows.length !== next.subRows.length) {
      return false;
    }

    for (let i = 0; i < prev.subRows.length; i++) {
      const a = prev.subRows[i];
      const b = next.subRows[i];
      if (a.label !== b.label || a.value !== b.value) {
        return false;
      }
    }
    return true;
  }
);