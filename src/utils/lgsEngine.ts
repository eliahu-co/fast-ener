import { GAUGE_MAP } from '../data/gauges';
import { FASTENERS } from '../data/fasteners';
import { DRILL_POINT_MAX } from '../data/drillPoints';
import type { Fastener } from '../types';

export function filterFasteners(
  attachmentThickness: number,
  substrateGauge: string,
  isOutdoor: boolean,
): Fastener[] {
  const substrateThickness = GAUGE_MAP[substrateGauge];
  if (substrateThickness === undefined) return [];

  const tmt = attachmentThickness + substrateThickness;
  const minLength = tmt + 0.25;

  const qualifying = FASTENERS
    .filter((f) => {
      if (isOutdoor && f.material !== '410 Stainless Steel') return false;
      if (DRILL_POINT_MAX[f.drillPoint][f.threadSize] < tmt) return false;
      if (f.length < minLength) return false;
      return true;
    })
    .sort((a, b) => a.length - b.length);

  if (qualifying.length === 0) return [];

  // Return only the two shortest distinct catalog lengths — the optimal pick plus
  // one reasonable alternative. Anything beyond that is unnecessary for the joint.
  const distinctLengths = [...new Set(qualifying.map((f) => f.length))];
  const cutoff = distinctLengths[Math.min(1, distinctLengths.length - 1)];
  return qualifying.filter((f) => f.length <= cutoff);
}
