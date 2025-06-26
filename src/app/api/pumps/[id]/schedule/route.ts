import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase';

type CalendarBlock = { pumpId: string; start: number; end: number };

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const { start, end } = await req.json();

  // Accept either a UNIX timestamp or ISO string, but convert both to a number
  const startNum = typeof start === "string" ? Date.parse(start) : start;
  const endNum = typeof end === "string" ? Date.parse(end) : end;

  if (
    typeof startNum !== "number" || isNaN(startNum) ||
    typeof endNum !== "number" || isNaN(endNum)
  ) {
    return NextResponse.json({ error: 'missing-dates' }, { status: 400 });
  }

  const db = getFirestore();
  const pumpRef = db.collection('pumps').doc(id);
  const blocksCol = db.collection('calendarBlocks');

  try {
    console.log('Starting schedule transaction:', { pumpId: id, start, end });
  
    await db.runTransaction(async (tx) => {
      console.log('Transaction start:', { pumpId: id, startNum, endNum });

      // Overlap: start < existing.end && end > existing.start
      const overlapSnap = await tx.get(
        blocksCol.where('start', '<', endNum).where('end', '>', startNum)
      );
      console.log('Overlap query result:', overlapSnap.empty);

      if (!overlapSnap.empty) throw new Error('overlap');

      tx.set(blocksCol.doc(), { pumpId: id, start: startNum, end: endNum } as CalendarBlock);
      tx.update(pumpRef, { status: 'scheduled' });

      console.log('Transaction successful for', id);
    });
  
    console.log('Transaction committed successfully');
  } catch (err) {
    console.error('API Transaction Error:', err);
    if ((err as Error).message === 'overlap') {
      return NextResponse.json({ error: 'overlap' }, { status: 409 });
    }
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
