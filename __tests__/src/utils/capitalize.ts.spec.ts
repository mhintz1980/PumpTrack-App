import { capitalize } from '@/utils/capitalize';

describe('capitalize()', () => {
  // Basic functionality tests
  it('capitalizes the first letter of a word', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('handles already capitalized words', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('handles empty strings', () => {
    expect(capitalize('')).toBe('');
  });

  it('handles single character strings', () => {
    expect(capitalize('a')).toBe('A');
  });

  // Edge cases - these should throw since the function expects a string
  it('throws error for null input', () => {
    expect(() => capitalize(null as any)).toThrow();
  });

  it('throws error for undefined input', () => {
    expect(() => capitalize(undefined as any)).toThrow();
  });

  // Property-based testing
  it('does not mutate original input', () => {
    const original = 'test string';
    const originalCopy = original;
    capitalize(original);
    expect(original).toBe(originalCopy);
  });
});