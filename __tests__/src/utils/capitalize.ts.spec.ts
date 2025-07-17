import { capitalize } from '@/utils/capitalize';

describe('capitalize()', () => {
  // Basic functionality tests
  

  // Edge cases
  it('handles null input gracefully', () => {
    expect(() => capitalize(null as any)).not.toThrow();
  });

  it('handles undefined input gracefully', () => {
    expect(() => capitalize(undefined as any)).not.toThrow();
  });

  // Property-based testing
  it('does not mutate original input', () => {
    const original = 'test string';
    const originalCopy = original;
    capitalize(original);
    expect(original).toBe(originalCopy);
  });
});