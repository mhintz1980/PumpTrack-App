/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextResponse } from 'next/server';
import { POST } from '@/app/api/pumps/[id]/schedule/route';

// lightweight Firestore stub – no TS syntax so Babel parses fine
jest.mock('@/lib/firebase', () => ({
  getFirestore: () => ({
    collection: () => ({
      doc: () => ({ id: 'dummy' }),
      where: () => ({ where: () => ({ get: () => ({ empty: true }) }) }),
    }),
    // tx is an object with get/set/update mocks
    runTransaction: async (fn) =>
      fn({
        get: async () => ({ empty: true }),
        set: jest.fn(),
        update: jest.fn(),
      }),
  }),
}));

describe('POST /api/pumps/:id/schedule', () => {
  it('returns 400 for missing dates', async () => {
    const res = await POST(new NextResponse().request, { params: { id: 'pumpA' } });
    expect(res.status).toBe(400);
  });
});
