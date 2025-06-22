import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase';

export async function GET() {
  const db = getFirestore();
  const pumps = await db.collection('pumps').get();

  let unscheduled = 0,
    scheduled = 0,
    inProcess = 0,
    totalOnOrder = 0;

  pumps.forEach((doc) => {
    const p = doc.data();
    switch (p.status) {
      case 'unscheduled':
        unscheduled++;
        break;
      case 'scheduled':
        scheduled++;
        break;
      case 'in-process':
        inProcess++;
        break;
    }
    totalOnOrder += p.quantity ?? 1; // default 1 if qty missing
  });

  return NextResponse.json({
    timestamp: Date.now(),
    unscheduledCount: unscheduled,
    scheduledCount: scheduled,
    inProcessCount: inProcess,
    totalOnOrder,
  });
}
