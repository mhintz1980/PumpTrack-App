import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase';

type CalendarBlock = { pumpId: string; start: number; end: number };

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  // await the params object before destructuring
  const { id } = await context.params;
  const { start, end } = await req.json();

  if (!start || !end)
    return NextResponse.json({ error: 'missing-dates' }, { status: 400 });

  const db = getFirestore();
  const pumpRef = db.collection('pumps').doc(id);
  const blocksCol = db.collection('calendarBlocks');

  try {
    await db.runTransaction(async (tx) => {
      // Overlap: start < existing.end && end > existing.start
      const overlapSnap = await tx.get(
        blocksCol.where('start', '<', end).where('end', '>', start)
      );
      if (!overlapSnap.empty) throw new Error('overlap');

      // Write block + mark pump
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
