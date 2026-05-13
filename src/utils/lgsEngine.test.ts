import { describe, it, expect } from 'vitest';
import { filterFasteners } from './lgsEngine';

describe('filterFasteners', () => {
  it('returns fasteners meeting minimum length requirement', () => {
    // attachment: 0.036" (20ga structural) + substrate: 18ga (0.048")
    // minLength = 0.036 + 0.048 + 0.25 = 0.334"
    const results = filterFasteners(0.036, '18 ga', false);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((f) => {
      expect(f.length).toBeGreaterThanOrEqual(0.334);
    });
  });

  it('rejects fasteners whose drill point capacity is below total metal thickness', () => {
    // attachment: 0.125" (1/8 in Structural) + substrate: 12ga (0.105") = TMT 0.230"
    // Point #2 max for #8 = 0.211" — must be rejected
    const results = filterFasteners(0.125, '12 ga', false);
    const dp2Max: Record<string, number> = {
      '#6': 0.190, '#8': 0.211, '#10': 0.235, '#12': 0.283, '#14': 0.318,
    };
    const dp3Max: Record<string, number> = {
      '#6': 0.220, '#8': 0.251, '#10': 0.300, '#12': 0.353, '#14': 0.393,
    };
    results.forEach((f) => {
      const capacity = f.drillPoint === 2 ? dp2Max[f.threadSize] : dp3Max[f.threadSize];
      expect(capacity).toBeGreaterThanOrEqual(0.230);
    });
  });

  it('filters to 410 SS only when isOutdoor is true', () => {
    const results = filterFasteners(0.033, '18 ga', true);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((f) => {
      expect(f.material).toBe('410 Stainless Steel');
    });
  });

  it('returns results sorted shortest to longest', () => {
    const results = filterFasteners(0.033, '16 ga', false);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].length).toBeGreaterThanOrEqual(results[i - 1].length);
    }
  });

  it('returns empty array for unknown gauge', () => {
    const results = filterFasteners(0.036, 'unknown gauge', false);
    expect(results).toHaveLength(0);
  });

  it('returns both material types for indoor environments', () => {
    const results = filterFasteners(0.033, '18 ga', false);
    const materials = new Set(results.map((f) => f.material));
    expect(materials.size).toBeGreaterThan(1);
  });

  it('caps results at the two shortest qualifying lengths — no overkill selections', () => {
    // 0.125" attachment + 18ga (0.048") → minLength 0.423"
    // Without the cap, 1.0", 1.25", 1.50" would all appear alongside 0.50" and 0.75"
    const results = filterFasteners(0.125, '18 ga', false);
    expect(results.length).toBeGreaterThan(0);
    const distinctLengths = [...new Set(results.map((f) => f.length))];
    expect(distinctLengths.length).toBeLessThanOrEqual(2);
    expect(Math.max(...results.map((f) => f.length))).toBe(0.75);
  });
});
