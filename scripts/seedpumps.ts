import { getFirestore } from '@/lib/firebase';

const db = getFirestore();

const pumps = [
  { id: '721413b2-7bc2-4e01-b121-da0e33231566', status: 'unscheduled' },
  { id: 'a115251e-d86f-4b8c-bddc-3e42ed639c9d', status: 'unscheduled' },
  // Add all your expected test IDs here
];

async function seed() {
  for (const pump of pumps) {
    await db.collection('pumps').doc(pump.id).set(pump);
    console.log(`Seeded ${pump.id}`);
  }
  process.exit(0);
}

seed();
