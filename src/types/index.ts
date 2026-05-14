export type AttachmentMaterial = 'steel' | 'gypsum' | 'foam' | 'wood';

export type ThreadSize = '#6' | '#8' | '#10' | '#12' | '#14';
export type DrillPointType = 2 | 3;
export type HeadDrive = 'Hex Washer Head' | 'Pan Head Phillips' | 'Flat Head Torx';
export type Material = 'Zinc-Plated Steel' | '410 Stainless Steel';

export interface Fastener {
  partNumber: string;
  threadSize: ThreadSize;
  length: number;
  headDrive: HeadDrive;
  material: Material;
  drillPoint: DrillPointType;
}

export interface AttachmentLayer {
  material: AttachmentMaterial;
  thickness: number;
}

/** Fastener as returned by the engine — includes computed minimum-length requirement. */
export interface FastenerResult extends Fastener {
  minLength: number;
}
