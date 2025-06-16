import { NextResponse } from 'next/server';
import type { KpiSnapshot } from '@/types';

export async function GET() {
  const snapshot: KpiSnapshot = {
    totalOnOrder: 12,
    unscheduledCount: 3,
    remainingBuildUnscheduled: 18,
    remainingBuildScheduled: 24,
    remainingBuildInProcess: 10,
    remainingBuildQueue: 4,
    utilizationPct: 72,
  };
  return NextResponse.json(snapshot);
}
