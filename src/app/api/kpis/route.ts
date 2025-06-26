import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase';

// GET /api/kpis – returns the newest KPI snapshot (or 404 if none yet)
export async function GET() {
  try {
    const db   = getFirestore();
    const snap = await db
      .collection('kpiSnapshots')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snap.empty) return NextResponse.json({}, { status: 404 });
    return NextResponse.json(snap.docs[0].data());
  } catch (err) {
    console.error('[kpis API] ', err);
    return NextResponse.json({ error: 'internal-error' }, { status: 500 });
  }
}
