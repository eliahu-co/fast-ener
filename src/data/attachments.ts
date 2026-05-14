import type { AttachmentMaterial, HeadDrive } from '../types';

export interface AttachmentPreset {
  label: string;
  thickness: number;
}

export interface AttachmentMaterialDef {
  id: AttachmentMaterial;
  label: string;
  /** Whether this material contributes to steel TMT (drill point capacity gate) */
  isSteel: boolean;
  /** Warn when thickness exceeds this value (e.g. wood > ½" needs reamer wings) */
  warnAbove?: number;
  warnMessage?: string;
  /**
   * Head drive types that are incompatible with this material and must be excluded.
   * e.g. Hex Washer Head crushes gypsum paper face.
   */
  excludeHeads?: HeadDrive[];
  /**
   * Informational note about head drive selection for this material,
   * shown in the UI but not enforced as a hard filter.
   */
  headNote?: string;
  presets: AttachmentPreset[];
}

export const ATTACHMENT_MATERIAL_DEFS: AttachmentMaterialDef[] = [
  {
    id: 'steel',
    label: 'Steel (LGS)',
    isSteel: true,
    presets: [
      { label: '25 ga',  thickness: 0.021 },
      { label: '20 ga',  thickness: 0.033 },
      { label: '18 ga',  thickness: 0.048 },
      { label: '16 ga',  thickness: 0.060 },
      { label: '14 ga',  thickness: 0.075 },
      { label: '12 ga',  thickness: 0.105 },
      { label: '1/8"',   thickness: 0.125 },
      { label: '3/16"',  thickness: 0.1875 },
      { label: '1/4"',   thickness: 0.250 },
    ],
  },
  {
    id: 'gypsum',
    label: 'Gypsum Board',
    isSteel: false,
    excludeHeads: ['Hex Washer Head'],
    headNote: 'Pan or Flat Head only — Hex Washer Head crushes the gypsum paper face.',
    presets: [
      { label: '1/4"',  thickness: 0.250 },
      { label: '3/8"',  thickness: 0.375 },
      { label: '1/2"',  thickness: 0.500 },
      { label: '5/8"',  thickness: 0.625 },
      { label: '3/4"',  thickness: 0.750 },
      { label: '1"',    thickness: 1.000 },
    ],
  },
  {
    id: 'foam',
    label: 'Polyiso / Foam',
    isSteel: false,
    excludeHeads: ['Hex Washer Head'],
    headNote: 'Pan or Flat Head only — wide bearing face needed to distribute load across foam without punching through.',
    presets: [
      { label: '1/2"',   thickness: 0.500 },
      { label: '1"',     thickness: 1.000 },
      { label: '1-1/2"', thickness: 1.500 },
      { label: '2"',     thickness: 2.000 },
      { label: '3"',     thickness: 3.000 },
      { label: '4"',     thickness: 4.000 },
    ],
  },
  {
    id: 'wood',
    label: 'OSB / Plywood',
    isSteel: false,
    warnAbove: 0.5,
    warnMessage: 'Wood > ½": reamer-wing screws recommended to prevent jacking — not in current catalog.',
    presets: [
      { label: '3/8"',   thickness: 0.375 },
      { label: '7/16"',  thickness: 0.4375 },
      { label: '1/2"',   thickness: 0.500 },
      { label: '5/8"',   thickness: 0.625 },
      { label: '3/4"',   thickness: 0.750 },
      { label: '1"',     thickness: 1.000 },
    ],
  },
];

export const ATTACHMENT_MATERIAL_MAP = Object.fromEntries(
  ATTACHMENT_MATERIAL_DEFS.map((d) => [d.id, d]),
) as Record<AttachmentMaterial, AttachmentMaterialDef>;
