import { truncate } from '@/utils/truncate';

describe('truncate()', () => {
  // Basic functionality tests
  it('returns "This is a..." for input "This is a long string"', () => {
    const result = truncate("This is a long string");
    expect(result).toBe("This is a...");
  });

  it('returns "Short" for input "Short"', () => {
    const result = truncate("Short");
    expect(result).toBe("Short");
  });

  it('returns "Exactly 10" for input "Exactly 10"', () => {
    const result = truncate("Exactly 10");
    expect(result).toBe("Exactly 10");
  });

  it('returns "Exactly..." for input "Exactly 10!"', () => {
    const result = truncate("Exactly 10!");
    expect(result).toBe("Exactly...");
  });
  // Edge cases
  it('handles empty string input', () => {
    const result = truncate("");
    expect(result).toBe("");
  });
  
  it('handles single character input', () => {
    const result = truncate("a");
    expect(result).toBe("A");
  });

  // Property-based testing
  it('does not mutate original input', () => {
    const original = 'test string';
    const originalCopy = original;
    truncate(original);
    expect(original).toBe(originalCopy);
  });
  
  it('is idempotent - applying it twice gives same result as once', () => {
    const input = 'example';
    const onceResult = truncate(input);
    const twiceResult = truncate(truncate(input));
    expect(onceResult).toBe(twiceResult);
  });
});