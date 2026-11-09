export interface ShedSummary {
  id: number;
  name: string;
  capacity: number;
  status: 'Active' | 'Empty' | 'Sanitizing';
  activeBatchCode?: string;
  flockAgeDays?: number;
  liveBirds?: number;
  mortalityRate?: number;
  fcr?: number;
}

export interface ActiveBatchMetrics {
  batchId: number;
  batchCode: string;
  shedId: number;
  shedName: string;
  placementDate: string;
  flockAgeDays: number;
  breed: string;
  initialChicks: number;
  cumulativeMortality: number;
  mortalityPercentage: number;
  livabilityPercentage: number;
  estimatedLiveBirds: number;
  totalFeedConsumedKg: number;
  feedIntakePerBirdGrams: number;
  avgBodyWeightKg: number;
  currentFcr: number;
  isFcrFavorable: boolean;
  epef: number;
  totalBirdsLifted: number;
  remainingBirds: number;
  estimatedGrowingCharges: number;
  settlementStatus: 'Pending' | 'In Progress' | 'Settled';
  isDemo: boolean;
}

export interface DailyLogEntry {
  id?: string;
  logDate: string;
  flockAgeDays: number;
  dailyMortality: number;
  dailyFeedBags: number;
  dailyFeedKg: number;
  avgBodyWeightGrams?: number;
  waterConsumptionLitres?: number;
  medicineAdministered?: string;
  remarks?: string;
}

export interface BirdLiftingEntry {
  id?: string;
  slipNo: string;
  liftingDate: string;
  buyerName: string;
  vehicleNo: string;
  cagesCount: number;
  birdsCount: number;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  avgWeightKg: number;
}
