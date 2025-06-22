// @ts-nocheck
const { GET } = require('@/app/api/kpis/route');

// stub Firestore collection().get()
jest.mock('@/lib/firebase', () => ({
  getFirestore: () => ({
    collection: () => ({
      get: async () => ({
        forEach: (fn) => [
          { data: () => ({ status: 'unscheduled', quantity: 2 }) },
          { data: () => ({ status: 'scheduled' }) },
          { data: () => ({ status: 'in-process', quantity: 3 }) },
        ].forEach(fn),
      }),
    }),
  }),
}));

test('GET /api/kpis aggregates counts', async () => {
  const res = await GET();
  const body = await res.json();
  expect(body.unscheduledCount).toBe(1);
  expect(body.scheduledCount).toBe(1);
  expect(body.inProcessCount).toBe(1);
  expect(body.totalOnOrder).toBe(6);
});
