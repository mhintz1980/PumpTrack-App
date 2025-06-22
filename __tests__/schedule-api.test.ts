import { NextResponse } from 'next/server';
import { POST } from '@/app/api/pumps/[id]/schedule/route';

// Mock getFirestore with an in-memory stub (simplest smoke test)
jest.mock('@/lib/firebase', () => ({
  getFirestore: () => ({
    collection: () => ({
      doc: () => ({ id: 'dummy' }),
      where: () => ({ where: () => ({ get: () => ({ empty: true }) }) }),
    }),
    runTransaction: async (fn: any) => fn({
      get: async () => ({ empty: true }),
      set: jest.fn(),
      update: jest.fn(),
    }),
  }),
}));

describe('POST /api/pumps/:id/schedule', () => {
  it('returns 400 for missing dates', async () => {
    const res = await POST(new Request(''), { params: { id: 'pumpA' } });
    expect(res).toBeInstanceOf(NextResponse);
    expect(res.status).toBe(400);
  });
});
