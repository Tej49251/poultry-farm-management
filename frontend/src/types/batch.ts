export interface BatchItem {
  id: number;
  batchCode: string;
  shedId: number;
  shedName: string;
  breed: string;
  placementDate: string;
  initialChicks: number;
  chickSupplier?: string;
  chickCostPerBird?: number;
  targetFcr: number;
  standardMortalityPct: number;
  targetHarvestAgeDays: number;
  status: 'Active' | 'Completed' | 'Settled';
  closedDate?: string;
  flockAgeDays: number;
  remarks?: string;
  estimatedLiveBirds: number;
  livabilityPercentage: number;
}

export interface CreateBatchInput {
  batchCode: string;
  shedId: number;
  breed: string;
  placementDate: string;
  initialChicks: number;
  chickSupplier?: string;
  chickCostPerBird?: number;
  targetFcr: number;
  standardMortalityPct: number;
  targetHarvestAgeDays: number;
  remarks?: string;
}
