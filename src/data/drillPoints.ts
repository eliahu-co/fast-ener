import type { DrillPointType, ThreadSize } from '../types';

/**
 * BSD (Spaced Thread) threads-per-inch per SAE J78-2013.
 * Confirmed by field spec: #8-18, #10-16.
 * Used to compute minimum thread engagement = 3 / TPI.
 */
export const TPI: Record<ThreadSize, number> = {
  '#6':  20,
  '#8':  18,
  '#10': 16,
  '#12': 14,
  '#14': 14,
};

/**
 * Maximum total metal thickness (inches) each drill point can penetrate.
 * The physical drill-point pilot length equals this capacity value,
 * so this table doubles as the "consumed length" in the min-length formula.
 * Source: DRILL_POINT_MAX values per ASTM C1513 / field reference.
 */
export const DRILL_POINT_MAX: Record<DrillPointType, Record<ThreadSize, number>> = {
  2: {
    '#6':  0.190,
    '#8':  0.211,
    '#10': 0.235,
    '#12': 0.283,
    '#14': 0.318,
  },
  3: {
    '#6':  0.220,
    '#8':  0.251,
    '#10': 0.300,
    '#12': 0.353,
    '#14': 0.393,
  },
};
