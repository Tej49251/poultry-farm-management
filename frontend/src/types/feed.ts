export type FeedStage = 'Pre-Starter' | 'Starter' | 'Finisher';
export type TransactionType = 'Inward' | 'Consumption' | 'Adjustment';

export interface FeedTransaction {
  id: string | number;
  transactionDate: string;
  feedType: FeedStage;
  transactionType: TransactionType;
  bagsCount: number;
  weightKgPerBag: number;
  totalWeightKg: number;
  supplierName?: string;
  supplierInvoiceNo?: string;
  costPerBag?: number;
  batchId?: number;
  remarks?: string;
}

export interface FeedStockSummary {
  feedType: FeedStage;
  stageDescription: string;
  targetFlockAge: string;
  currentStockBags: number;
  currentStockKg: number;
  stockStatus: 'Adequate' | 'Low Stock' | 'Critical';
  estimatedDaysLeft: number;
}
