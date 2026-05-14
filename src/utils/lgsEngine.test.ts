import { describe, it, expect } from 'vitest';
import { filterFasteners } from './lgsEngine';
import { DRILL_POINT_MAX, TPI } from '../data/drillPoints';
import { GAUGE_MAP } from '../data/gauges';

describe('filterFasteners', () => {
  it('every result meets SAE J78 minimum length for its own drill point and thread size', () => {
    // 20ga structural attachment (0.036") to 18ga substrate (0.048")
    const totalStack = 0.036 + GAUGE_MAP['18 ga'];
    const results = filterFasteners([{ material: 'steel', thickness: 0.036 }], '18 ga', false);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((f) => {
      const minLen = totalStack + DRILL_POINT_MAX[f.drillPoint][f.threadSize] + 3 / TPI[f.threadSize];
      expect(f.length).toBeGreaterThanOrEqual(minLen - 1e-9);
    });
  });

  it('rejects fasteners whose drill point capacity is below total metal thickness', () => {
    // 1/8" steel attachment (0.125") + 12ga (0.105") = steelTMT 0.230"
    // Point #2 max for #8 = 0.211" — must be rejected
    const results = filterFasteners([{ material: 'steel', thickness: 0.125 }], '12 ga', false);
    const steelTMT = 0.125 + GAUGE_MAP['12 ga'];
    results.forEach((f) => {
      expect(DRILL_POINT_MAX[f.drillPoint][f.threadSize]).toBeGreaterThanOrEqual(steelTMT);
    });
  });

  it('filters to 410 SS only when isOutdoor is true', () => {
    const results = filterFasteners([{ material: 'steel', thickness: 0.033 }], '18 ga', true);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((f) => {
      expect(f.material).toBe('410 Stainless Steel');
    });
  });

  it('returns results sorted shortest to longest', () => {
    const results = filterFasteners([{ material: 'steel', thickness: 0.033 }], '16 ga', false);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].length).toBeGreaterThanOrEqual(results[i - 1].length);
    }
  });

  it('returns empty array for unknown gauge', () => {
    const results = filterFasteners([{ material: 'steel', thickness: 0.036 }], 'unknown gauge', false);
    expect(results).toHaveLength(0);
  });

  it('returns both material types for indoor environments', () => {
    // 1/8" steel att (0.125") + 12ga substrate (0.105") → steelTMT 0.230" → only Pt3 #8+
    // qualifies. Shortest catalog entry at that capacity is 0.75", present in both
    // Zinc-Plated (92198A140) and 410 SS (90926A010), so both materials appear.
    const results = filterFasteners([{ material: 'steel', thickness: 0.125 }], '12 ga', false);
    const materials = new Set(results.map((f) => f.material));
    expect(materials.size).toBeGreaterThan(1);
  });

  it('caps results at the two shortest qualifying lengths — no overkill selections', () => {
    const results = filterFasteners([{ material: 'steel', thickness: 0.125 }], '18 ga', false);
    expect(results.length).toBeGreaterThan(0);
    const distinctLengths = [...new Set(results.map((f) => f.length))];
    expect(distinctLengths.length).toBeLessThanOrEqual(2);
  });

  it('field validation: #10 Pt3 formula numerics match spreadsheet', () => {
    // Spreadsheet: #10-16, Drill Point #3 = 0.300, 3 Threads = 0.1875
    const pointLength = DRILL_POINT_MAX[3]['#10'];
    const engagement = 3 / TPI['#10'];
    expect(pointLength).toBeCloseTo(0.300, 3);
    expect(engagement).toBeCloseTo(0.1875, 4);
  });

  it('SAE J78 formula adds more than the old 0.25" proxy for all fastener types', () => {
    const sizes = ['#6', '#8', '#10', '#12', '#14'] as const;
    const points = [2, 3] as const;
    points.forEach((dp) => {
      sizes.forEach((sz) => {
        const added = DRILL_POINT_MAX[dp][sz] + 3 / TPI[sz];
        expect(added).toBeGreaterThan(0.25);
      });
    });
  });

  // ── Non-steel attachment material tests ──────────────────────────────────

  it('non-steel attachment: drill point gate uses only substrate steel thickness', () => {
    // 1/2" gypsum (non-steel) + 18ga substrate (0.048") → steelTMT = 0.048"
    const results = filterFasteners([{ material: 'gypsum', thickness: 0.500 }], '18 ga', false);
    expect(results.length).toBeGreaterThan(0);
    const steelTMT = GAUGE_MAP['18 ga'];
    results.forEach((f) => {
      expect(DRILL_POINT_MAX[f.drillPoint][f.threadSize]).toBeGreaterThanOrEqual(steelTMT);
    });
  });

  it('non-steel attachment: screw length accounts for full stack (gypsum + steel)', () => {
    // 5/8" gypsum (0.625") + 18ga (0.048") = totalStack 0.673"
    const totalStack = 0.625 + GAUGE_MAP['18 ga'];
    const results = filterFasteners([{ material: 'gypsum', thickness: 0.625 }], '18 ga', false);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((f) => {
      const minLen = totalStack + DRILL_POINT_MAX[f.drillPoint][f.threadSize] + 3 / TPI[f.threadSize];
      expect(f.length).toBeGreaterThanOrEqual(minLen - 1e-9);
    });
  });

  it('foam attachment: produces longer screws than equivalent steel attachment', () => {
    const foamResults = filterFasteners([{ material: 'foam', thickness: 0.500 }], '18 ga', false);
    const steelResults = filterFasteners([{ material: 'steel', thickness: 0.033 }], '18 ga', false);
    expect(foamResults.length).toBeGreaterThan(0);
    const shortestFoam = Math.min(...foamResults.map((f) => f.length));
    const shortestSteel = Math.min(...steelResults.map((f) => f.length));
    expect(shortestFoam).toBeGreaterThan(shortestSteel);
  });

  it('gypsum attachment: no Hex Washer Head results returned', () => {
    const results = filterFasteners([{ material: 'gypsum', thickness: 0.500 }], '18 ga', false);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((f) => {
      expect(f.headDrive).not.toBe('Hex Washer Head');
    });
  });

  it('foam attachment: no Hex Washer Head results returned (pan/flat only)', () => {
    const results = filterFasteners([{ material: 'foam', thickness: 0.500 }], '18 ga', false);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((f) => {
      expect(f.headDrive).not.toBe('Hex Washer Head');
    });
  });

  it('wood attachment: drill point gate uses substrate steel only', () => {
    const results = filterFasteners([{ material: 'wood', thickness: 0.375 }], '18 ga', false);
    expect(results.length).toBeGreaterThan(0);
    const steelTMT = GAUGE_MAP['18 ga'];
    results.forEach((f) => {
      expect(DRILL_POINT_MAX[f.drillPoint][f.threadSize]).toBeGreaterThanOrEqual(steelTMT);
    });
  });

  // ── Multi-layer tests ─────────────────────────────────────────────────────

  it('multi-layer: total stack includes thickness of all layers combined', () => {
    // foam 0.500" + steel 0.033" + 18ga substrate 0.048" = totalStack 0.581"
    const foamThickness  = 0.500;
    const steelThickness = 0.033;
    const totalStack = foamThickness + steelThickness + GAUGE_MAP['18 ga'];
    const results = filterFasteners(
      [
        { material: 'foam',  thickness: foamThickness  },
        { material: 'steel', thickness: steelThickness },
      ],
      '18 ga',
      false,
    );
    expect(results.length).toBeGreaterThan(0);
    results.forEach((f) => {
      const minLen = totalStack + DRILL_POINT_MAX[f.drillPoint][f.threadSize] + 3 / TPI[f.threadSize];
      expect(f.length).toBeGreaterThanOrEqual(minLen - 1e-9);
    });
  });

  it('multi-layer: head type follows layers[0] (outermost), not inner layers', () => {
    // Outer = gypsum (excludes Hex Washer Head), inner = steel
    // Result must still exclude Hex Washer Head despite the inner steel layer
    const results = filterFasteners(
      [
        { material: 'gypsum', thickness: 0.500 },
        { material: 'steel',  thickness: 0.033 },
      ],
      '18 ga',
      false,
    );
    expect(results.length).toBeGreaterThan(0);
    results.forEach((f) => {
      expect(f.headDrive).not.toBe('Hex Washer Head');
    });
  });
});
