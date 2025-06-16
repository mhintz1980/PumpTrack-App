'use client';
import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KpiRow { label: string; value: React.ReactNode }

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value?: React.ReactNode;
  rows?: KpiRow[];
  caption?: string;
}

export const KpiCard = React.memo(function KpiCard({
  icon: Icon,
  label,
  value,
  rows,
  caption,
}: KpiCardProps) {
  return (
    <div className="w-48 rounded-lg bg-glass-surface/30 backdrop-blur p-4 shadow-md">
      <div className="flex items-center gap-2 text-sm text-slate-300 mb-1">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      {value && <div className="text-2xl font-semibold">{value}</div>}
      {rows && (
        <div className="space-y-1">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between text-sm text-slate-300">
              <span>{r.label} :</span>
              <span>{r.value}</span>
            </div>
          ))}
        </div>
      )}
      {caption && <div className="text-sm text-slate-300 mt-1">{caption}</div>}
    </div>
  );
});
