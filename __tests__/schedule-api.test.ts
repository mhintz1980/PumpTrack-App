/* eslint-disable @typescript-eslint/ban-ts-comment */
const { NextResponse } = require('next/server');
const { POST } = require('@/app/api/pumps/[id]/schedule/route');

// Stub Firestore
jest.mock('@/lib/firebase', () => ({
  getFirestore: () => ({
    collection: () => ({
      doc: () => ({ id: 'dummy' }),
      where: () => ({ where: () => ({ get: () => ({ empty: true }) }) }),
    }),
    runTransaction: async (fn) =>
      fn({
        get: async () => ({ empty: true }),
        set: jest.fn(),
        update: jest.fn(),
      }),
  }),
}));

describe('POST /api/pumps/:id/schedule', () => {
  it('returns 400 when dates are missing', async () => {
    const res = await POST(new NextResponse().request, { params: { id: 'pumpA' } });
    expect(res.status).toBe(400);
  });
});
