import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

initializeApp();
const db = getFirestore();

async function recomputeKpis() {
  const pumpsSnap = await db.collection('pumps').get();

  let unscheduled = 0,
      scheduled   = 0,
      inProcess   = 0,
      totalOnOrder = 0;

  pumpsSnap.forEach(doc => {
    const p = doc.data();
    switch (p.status) {
      case 'unscheduled': unscheduled++; break;
      case 'scheduled':   scheduled++;   break;
      case 'in-process':  inProcess++;   break;
    }
    totalOnOrder += p.quantity ?? 1;
  });

  await db.collection('kpiSnapshots').add({
    timestamp: Date.now(),
    unscheduledCount: unscheduled,
    scheduledCount:   scheduled,
    inProcessCount:   inProcess,
    totalOnOrder,
  });
}

export const recalcKpis = functions.firestore
  .document('{colId=pumps,calendarBlocks}/{docId}')
  .onWrite(() => recomputeKpis());