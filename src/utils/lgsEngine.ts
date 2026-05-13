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

  return FASTENERS
    .filter((f) => {
      if (isOutdoor && f.material !== '410 Stainless Steel') return false;
      if (DRILL_POINT_MAX[f.drillPoint][f.threadSize] < tmt) return false;
      if (f.length < minLength) return false;
      return true;
    })
    .sort((a, b) => a.length - b.length);
}
