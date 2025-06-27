import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase';

export async function POST(req: Request) {
  try {
    const { pumpIds } = await req.json();
    if (!Array.isArray(pumpIds)) {
      return NextResponse.json({ error: 'Missing pumpIds array' }, { status: 400 });
    }
    const db = getFirestore();
    const batch = db.batch();
    for (const id of pumpIds) {
      const ref = db.collection('pumps').doc(id);
      batch.set(ref, { status: 'unscheduled' }, { merge: true });
    }
    await batch.commit();
    return NextResponse.json({ ok: true, count: pumpIds.length });
  } catch (err) {
    console.error('Seeding error:', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
