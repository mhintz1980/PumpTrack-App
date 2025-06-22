// @ts-nocheck
const { GET } = require('@/app/api/kpis/route');

jest.mock('@/lib/firebase', () => ({
  getFirestore: () => ({
    collection: () => ({
      orderBy: () => ({
        limit: () => ({
          get: async () => ({
            empty: false,
            docs: [
              {
                data: () => ({
                  unscheduledCount: 1,
                  scheduledCount: 1,
                  inProcessCount: 1,
                  totalOnOrder: 6,
                  timestamp: Date.now(),
                }),
              },
            ],
          }),
        }),
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
