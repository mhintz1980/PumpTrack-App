import React from "react";
import useSWR from "swr";
import { Package, Layers, Zap } from 'lucide-react';
import { KpiCard, KpiSubRow } from "./KpiCard";
import type { KpiSnapshot } from "@/types";

/**
 * Props for KpiDeck.
 */
interface KpiDeckProps {
  snapshot: KpiSnapshot;
}

const KpiDeckComponent: React.FC<KpiDeckProps> = ({ snapshot }) => {
  // Card 1: Unscheduled
  const unscheduledValue = `${snapshot.unscheduledCount} of ${snapshot.totalOnOrder}`;

  // Card 2: Remaining Work (stacked rows)
  const remainingRows: KpiSubRow[] = [
    { label: "Unscheduled", value: snapshot.unscheduledCount },
    { label: "Scheduled", value: snapshot.scheduledCount },
    { label: "In Process", value: snapshot.inProcessCount },
  ];

  // Card 3: Capacity
  const capacityValue =
    typeof snapshot.utilizationPct === "number"
      ? `${snapshot.utilizationPct}%`
      : "N/A";

  return (
    <div className="flex gap-6">
      <KpiCard
        id="unscheduled"
        icon={Package}
        label="Unscheduled"
        value={unscheduledValue}
      />
      <KpiCard
        id="remaining"
        icon={Layers}
        label="Remaining Work"
        value=""
        subRows={remainingRows}
      />
      <KpiCard
        id="capacity"
        icon={Zap}
        label="Capacity"
        value={capacityValue}
      />
    </div>
  );
};

export const KpiDeck = React.memo(
  KpiDeckComponent,
  (prev, next) => JSON.stringify(prev.snapshot) === JSON.stringify(next.snapshot)
);

/**
 * Data-fetching wrapper for KpiDeck.
 * Fetches /api/kpis and refreshes every 30s.
 */
const fetcher = (url: string) => fetch(url).then(res => res.json());

export const KpiDeckWithData: React.FC = () => {
  const { data, error, isLoading } = useSWR<KpiSnapshot>(
    "/api/kpis",
    fetcher,
    { refreshInterval: 30000 }
  );

  if (isLoading) return <div>Loading KPIs...</div>;
  if (error) return <div>Error loading KPIs</div>;
  if (!data) return null;

  return <KpiDeck snapshot={data} />;
};