// __mocks__/stripe.ts
// Example mock for Stripe API used in tests

export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({ id: 'ch_12345', status: 'succeeded' }),
    retrieve: jest.fn().mockResolvedValue({ id: 'ch_12345', status: 'succeeded' }),
  },
  customers: {
    create: jest.fn().mockResolvedValue({ id: 'cus_12345' }),
    retrieve: jest.fn().mockResolvedValue({ id: 'cus_12345' }),
  },
  // Add more mocks as needed for your test scenarios
};