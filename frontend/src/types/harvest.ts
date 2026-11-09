export interface LiftingSlipItem {
  id?: string | number;
  slipNo: string;
  liftingDate: string;
  buyerName: string;
  vehicleNo: string;
  driverName?: string;
  cagesCount: number;
  birdsCount: number;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  avgWeightKg: number;
  transitMortalityBirds?: number;
}

export interface SettlementVoucherItem {
  id?: string | number;
  batchId: number;
  voucherNo: string;
  settlementDate: string;
  totalBirdsLifted: number;
  totalNetWeightKg: number;
  actualFcr: number;
  benchmarkFcr: number;
  actualMortalityPct: number;
  standardMortalityPct: number;
  baseGcRatePerKg: number;
  baseGrowingCharges: number;
  fcrIncentive: number;
  otherIncentives: number;
  mortalityDeduction: number;
  medicineDeduction: number;
  totalDeductions: number;
  netPayableAmount: number;
  status: 'Draft' | 'Approved' | 'Paid';
  remarks?: string;
}
