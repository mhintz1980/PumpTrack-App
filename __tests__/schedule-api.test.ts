const { Request } = require('node-fetch');      // Our polyfilled WHATWG Request
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
    // real Request with empty JSON body
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),     // no start/end
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req, { params: { id: 'pumpA' } });
    expect(res.status).toBe(400);
  });
});
