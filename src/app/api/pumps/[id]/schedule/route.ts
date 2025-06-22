import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase';

type CalendarBlock = { pumpId: string; start: number; end: number };

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { start, end } = await req.json();

  if (!start || !end)
    return NextResponse.json({ error: 'missing-dates' }, { status: 400 });

  const db = getFirestore();
  const pumpRef = db.collection('pumps').doc(id);
  const blocksCol = db.collection('calendarBlocks');

  try {
    await db.runTransaction(async (tx) => {
      // overlap check
      const overlapSnap = await tx.get(
        blocksCol.where('start', '<', end).where('end', '>', start)
      );
      if (!overlapSnap.empty) throw new Error('overlap');

      // write block + update pump
      tx.set(blocksCol.doc(), { pumpId: id, start, end } as CalendarBlock);
      tx.update(pumpRef, { status: 'scheduled' });
    });
  } catch (err) {
    if ((err as Error).message === 'overlap') {
      return NextResponse.json({ error: 'overlap' }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
