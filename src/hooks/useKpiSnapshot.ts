import { useQuery } from '@tanstack/react-query';
import type { KpiSnapshot } from '@/types';

async function fetchKpiSnapshot(): Promise<KpiSnapshot> {
  const res = await fetch('/api/kpis');
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
}

export function useKpiSnapshot() {
  return useQuery({
    queryKey: ['kpi-snapshot'],
    queryFn: fetchKpiSnapshot,
    refetchInterval: 30000,
  });
}
