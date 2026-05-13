import type { DrillPointType, ThreadSize } from '../types';

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
