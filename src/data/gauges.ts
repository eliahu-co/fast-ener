export const GAUGE_MAP: Record<string, number> = {
  '25 ga': 0.021,
  '20 ga (Drywall)': 0.033,
  '20 ga (Structural)': 0.036,
  '18 ga': 0.048,
  '16 ga': 0.060,
  '14 ga': 0.075,
  '12 ga': 0.105,
  '1/8 in Structural': 0.125,
};

export const GAUGE_LABELS = Object.keys(GAUGE_MAP) as string[];
