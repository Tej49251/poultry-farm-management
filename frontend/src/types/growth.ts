export interface WeightSampleItem {
  id: string | number;
  sampleDate: string;
  flockAgeDays: number;
  sampleBirdsCount: number;
  avgWeightGrams: number;
  uniformityPct: number;
  breedStandardTargetGrams: number;
  varianceGrams: number;
  computedCumulativeFcr: number;
  remarks?: string;
}

export interface GrowthCurvePoint {
  ageDays: number;
  label: string;
  actualWeightGrams?: number;
  targetWeightGrams: number;
  cumulativeFcr?: number;
  targetFcr: number;
}
