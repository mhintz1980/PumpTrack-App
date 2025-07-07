import { describe, expect, it } from 'vitest';
import { capitalize } from '@/utils/capitalize';

describe('capitalize()', () => {
  it('AC-1: turns "pump" into "Pump"', () => {
    expect(capitalize('pump')).toBe('Pump');
  });

  it('AC-2: turns "card" into "Card"', () => {
    expect(capitalize('card')).toBe('Card');
  });

  it('AC-3: returns empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });

  it('FR-3: does not mutate the original string', () => {
    const original = 'pump';
    capitalize(original);
    expect(original).toBe('pump');
  });
});
