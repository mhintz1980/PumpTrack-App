import { describe, it, expect } from 'vitest';
import { capitalize } from '@/utils/capitalize';

describe('capitalize()', () => {
  // AC-1: GIVEN "pump" WHEN capitalize() THEN "Pump"
  it('returns "Pump" for input "pump"', () => {
    expect(capitalize("pump")).toBe("Pump");
  });

  // AC-2: GIVEN "card" WHEN capitalize() THEN "Card"
  it('returns "Card" for input "card"', () => {
    expect(capitalize("card")).toBe("Card");
  });

  // AC-3: GIVEN "" (empty) WHEN capitalize() THEN returns ""
  it('returns "" for empty input', () => {
    expect(capitalize("")).toBe("");
  });

  // FR-1 & FR-2: does not change remaining characters, returns unchanged for empty
  it('returns unchanged input if already capitalized', () => {
    expect(capitalize("Pump")).toBe("Pump");
  });

  // FR-3: does not mutate original string argument
  it('does not mutate the original string', () => {
    const original = "pump";
    capitalize(original);
    expect(original).toBe("pump");
  });
});
