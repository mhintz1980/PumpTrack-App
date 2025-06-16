'use client';
import React from 'react';
import { CalendarX, Clock, Cpu } from 'lucide-react';
import type { KpiSnapshot } from '@/types';
import { KpiCard } from './KpiCard';

interface KpiDeckProps {
  snapshot: KpiSnapshot;
}

export const KpiDeck = React.memo(function KpiDeck({ snapshot }: KpiDeckProps) {
  return (
    <div className="flex gap-4 ml-auto">
      <KpiCard
        icon={CalendarX}
        label="Unscheduled"
        value={`${snapshot.unscheduledCount} of ${snapshot.totalOnOrder}`}
      />
      <KpiCard
        icon={Clock}
        label="Remaining Work"
        rows={[
          { label: 'Unscheduled', value: `${snapshot.remainingBuildUnscheduled} d` },
          { label: 'Scheduled', value: `${snapshot.remainingBuildScheduled} d` },
          { label: 'In Process', value: `${snapshot.remainingBuildInProcess} d` },
        ]}
      />
      <KpiCard
        icon={Cpu}
        label="Capacity"
        value={snapshot.utilizationPct !== undefined ? `${snapshot.utilizationPct}%` : 'N/A'}
        caption="Crew Utilization"
      />
    </div>
  );
});
