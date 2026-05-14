import { GAUGE_MAP } from '../data/gauges';
import { FASTENERS } from '../data/fasteners';
import { DRILL_POINT_MAX, TPI } from '../data/drillPoints';
import { ATTACHMENT_MATERIAL_MAP } from '../data/attachments';
import type { AttachmentLayer, Fastener, FastenerResult } from '../types';

/**
 * Minimum screw length per SAE J78-2013 / SST C-F-2025TECHSUP:
 *
 *   minLength = totalStack + drillPointLength + 3 / TPI
 *
 * totalStack: ALL materials in the connection (steel + non-steel layers).
 * drillPointLength: the unthreaded pilot section must fully clear all steel
 *   before threads engage — its physical length equals the drill point's
 *   max-capacity value (DRILL_POINT_MAX).
 * threadEngagement: 3 threads of pull-out resistance beyond the last steel face.
 *
 * Source: SST "Max Grip Length" definition (p.13), SAE J78-2013 BSD TPI table,
 *   confirmed against field spreadsheet (#10-16 → 0.300 + 0.188 = 0.488 added).
 */
function minScrewLength(totalStack: number, f: Fastener): number {
  return totalStack + DRILL_POINT_MAX[f.drillPoint][f.threadSize] + 3 / TPI[f.threadSize];
}

export function filterFasteners(
  layers: AttachmentLayer[],
  substrateGauge: string,
  isOutdoor: boolean,
): FastenerResult[] {
  if (layers.length === 0) return [];

  const substrateThickness = GAUGE_MAP[substrateGauge];
  if (substrateThickness === undefined) return [];

  // Drill point capacity gate: only steel layers count toward TMT.
  // Non-steel materials (gypsum, foam, wood) don't resist the drill point.
  const steelTMT =
    layers.reduce((sum, layer) => {
      const matDef = ATTACHMENT_MATERIAL_MAP[layer.material];
      return sum + (matDef.isSteel ? layer.thickness : 0);
    }, 0) + substrateThickness;

  // Screw length formula: all materials in the stack must be spanned.
  const totalStack =
    layers.reduce((sum, layer) => sum + layer.thickness, 0) + substrateThickness;

  // Head exclusion: outermost layer only — screw head bears on outer surface.
  const outerMatDef = ATTACHMENT_MATERIAL_MAP[layers[0].material];

  const qualifying: FastenerResult[] = FASTENERS
    .filter((f) => {
      if (isOutdoor && f.material !== '410 Stainless Steel') return false;
      if (DRILL_POINT_MAX[f.drillPoint][f.threadSize] < steelTMT) return false;
      if (f.length < minScrewLength(totalStack, f)) return false;
      if (outerMatDef.excludeHeads?.includes(f.headDrive)) return false;
      return true;
    })
    .map((f) => ({ ...f, minLength: minScrewLength(totalStack, f) }))
    .sort((a, b) => a.length - b.length);

  if (qualifying.length === 0) return [];

  // Two shortest distinct catalog lengths — optimal pick plus one alternative.
  const distinctLengths = [...new Set(qualifying.map((f) => f.length))];
  const cutoff = distinctLengths[Math.min(1, distinctLengths.length - 1)];
  return qualifying.filter((f) => f.length <= cutoff);
}
