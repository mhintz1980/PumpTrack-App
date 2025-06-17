import { NextResponse } from 'next/server';
import { getAllPumps } from '@/services/pumpService';
import type { KpiSnapshot, StageId } from '@/types';

const IN_PROCESS_STAGES: StageId[] = ['powder-coat', 'assembly', 'testing'];

export async function GET() {
  const pumps = await getAllPumps();

  const unscheduledCount = pumps.filter(p => p.currentStage === 'open-jobs').length;
  const scheduledCount = pumps.filter(p => p.currentStage === 'fabrication').length;
  const inProcessCount = pumps.filter(p => IN_PROCESS_STAGES.includes(p.currentStage)).length;

  const totalOnOrder = pumps.filter(p => p.currentStage !== 'shipped').length;

  const snapshot: KpiSnapshot = {
    unscheduledCount,
    totalOnOrder,
    scheduledCount,
    inProcessCount,
    utilizationPct: null,
  };

  return NextResponse.json(snapshot);
}
