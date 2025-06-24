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
    console.log('Starting schedule transaction:', { pumpId: id, start, end });
  
    await db.runTransaction(async (tx) => {
      const overlapQuery = blocksCol.where('start', '<', end).where('end', '>', start);
      console.log('Overlap query prepared:', overlapQuery);
  
      const overlapSnap = await tx.get(overlapQuery);
      console.log('Overlap snapshot size:', overlapSnap.size);
  
      if (!overlapSnap.empty) {
        console.log('Overlap detected, throwing error');
        throw new Error('overlap');
      }
  
      console.log('No overlap, writing calendar block and updating pump');
      tx.set(blocksCol.doc(), { pumpId: id, start, end });
      tx.update(pumpRef, { status: 'scheduled' });
    });
  
    console.log('Transaction committed successfully');
  } catch (err) {
    console.error('Schedule transaction failed:', err);
    if ((err as Error).message === 'overlap') {
      return NextResponse.json({ error: 'overlap' }, { status: 409 });
    }
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
