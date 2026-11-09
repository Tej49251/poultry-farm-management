/**
 * API Service Client for Poultry Farm Management Web Dashboard.
 * Integrates frontend components with the FastAPI backend REST API.
 * Gracefully handles offline fallback to ensure continuous operation.
 */

import { ActiveBatchMetrics, DailyLogEntry, ShedSummary } from '../types/dashboard';
import { BatchItem, CreateBatchInput } from '../types/batch';
import { FeedTransaction } from '../types/feed';
import { WeightSampleItem, GrowthCurvePoint } from '../types/growth';
import { LiftingSlipItem, SettlementVoucherItem } from '../types/harvest';

const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:8000/api/v1';

// Token storage key
const AUTH_TOKEN_KEY = 'pfm_auth_token';
const USER_KEY = 'pfm_user_profile';

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface BackendHealth {
  online: boolean;
  service?: string;
  phase?: string;
  database?: string;
}

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  private static setToken(token: string) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  public static getStoredUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static setStoredUser(user: UserProfile) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public static clearAuth() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMsg = typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        if (errorText) errorMsg = errorText;
      }
      throw new Error(errorMsg);
    }

    return response.json() as Promise<T>;
  }

  // --- HEALTH & STATUS ---
  public static async checkHealth(): Promise<BackendHealth> {
    try {
      const res = await fetch('http://localhost:8000/health', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return { online: false };
      const data = await res.json();
      return {
        online: true,
        service: data.service,
        phase: data.phase,
        database: data.database,
      };
    } catch {
      return { online: false };
    }
  }

  // --- AUTHENTICATION ---
  public static async login(username: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(res.access_token);
    this.setStoredUser(res.user);
    return res;
  }

  public static async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me');
  }

  // --- DASHBOARD OVERVIEW ---
  public static async getDashboardOverview(batchId?: number): Promise<{
    activeBatch: ActiveBatchMetrics;
    sheds: ShedSummary[];
    recentLogs: DailyLogEntry[];
    systemStatus: string;
  }> {
    const query = batchId ? `?batch_id=${batchId}` : '';
    const res = await this.request<any>(`/dashboard/overview${query}`);
    return {
      activeBatch: {
        batchId: res.active_batch.batch_id,
        batchCode: res.active_batch.batch_code,
        shedId: res.active_batch.shed_id || 1,
        shedName: res.active_batch.shed_name,
        placementDate: res.active_batch.placement_date,
        flockAgeDays: res.active_batch.flock_age_days,
        breed: res.active_batch.breed,
        initialChicks: res.active_batch.initial_chicks,
        cumulativeMortality: res.active_batch.cumulative_mortality,
        mortalityPercentage: res.active_batch.mortality_percentage,
        livabilityPercentage: res.active_batch.livability_percentage,
        estimatedLiveBirds: res.active_batch.estimated_live_birds,
        totalFeedConsumedKg: res.active_batch.total_feed_consumed_kg,
        feedIntakePerBirdGrams: res.active_batch.feed_intake_per_bird_grams || 0,
        avgBodyWeightKg: res.active_batch.average_body_weight_kg,
        currentFcr: res.active_batch.current_fcr,
        isFcrFavorable: res.active_batch.current_fcr <= 1.60,
        epef: res.active_batch.epef,
        totalBirdsLifted: res.active_batch.total_birds_lifted,
        remainingBirds: res.active_batch.remaining_birds,
        estimatedGrowingCharges: res.active_batch.estimated_growing_charges,
        settlementStatus: res.active_batch.settlement_status === 'Settled' ? 'Settled' : 'In Progress',
        isDemo: res.active_batch.is_demo,
      },
      sheds: (res.sheds || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        capacity: s.capacity,
        status: s.status as any,
        activeBatchCode: s.active_batch_code,
        flockAgeDays: s.flock_age_days,
        liveBirds: s.live_birds,
        mortalityRate: s.mortality_pct,
        fcr: s.current_fcr,
      })),
      recentLogs: (res.recent_logs || []).map((l: any) => ({
        id: String(l.id),
        logDate: l.date,
        flockAgeDays: l.flock_age_days,
        dailyMortality: l.mortality_count,
        dailyFeedBags: l.feed_consumed_bags,
        dailyFeedKg: l.feed_consumed_kg,
        avgBodyWeightGrams: l.avg_weight_grams,
        waterConsumptionLitres: l.water_intake_liters,
        remarks: l.remarks,
      })),
      systemStatus: res.system_status,
    };
  }

  // --- BATCH MANAGEMENT ---
  public static async getBatches(statusFilter?: string): Promise<BatchItem[]> {
    const query = statusFilter ? `?status=${statusFilter}` : '';
    const items = await this.request<any[]>(`/batches${query}`);
    return items.map((b) => ({
      id: b.id,
      batchCode: b.batch_code,
      shedId: b.shed_id,
      shedName: b.shed_name || `Shed ${b.shed_id}`,
      breed: b.breed,
      placementDate: b.placement_date,
      closedDate: b.closed_date,
      initialChicks: b.initial_chicks,
      chickSupplier: b.chick_supplier,
      chickCostPerBird: b.chick_cost_per_bird,
      targetFcr: b.target_fcr,
      standardMortalityPct: b.standard_mortality_pct,
      targetHarvestAgeDays: b.target_harvest_age_days,
      status: b.status,
      flockAgeDays: b.flock_age_days,
      remarks: b.remarks,
      estimatedLiveBirds: b.estimated_live_birds || b.initial_chicks,
      livabilityPercentage: b.livability_percentage || 100.0,
    }));
  }

  public static async createBatch(input: CreateBatchInput): Promise<BatchItem> {
    const payload = {
      batch_code: input.batchCode,
      shed_id: input.shedId,
      breed: input.breed,
      placement_date: input.placementDate,
      initial_chicks: input.initialChicks,
      chick_supplier: input.chickSupplier,
      chick_cost_per_bird: input.chickCostPerBird,
      target_fcr: input.targetFcr,
      standard_mortality_pct: input.standardMortalityPct,
      target_harvest_age_days: input.targetHarvestAgeDays,
      remarks: input.remarks,
    };
    const b = await this.request<any>('/batches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      id: b.id,
      batchCode: b.batch_code,
      shedId: b.shed_id,
      shedName: b.shed_name || `Shed ${b.shed_id}`,
      breed: b.breed,
      placementDate: b.placement_date,
      initialChicks: b.initial_chicks,
      chickSupplier: b.chick_supplier,
      chickCostPerBird: b.chick_cost_per_bird,
      targetFcr: b.target_fcr,
      standardMortalityPct: b.standard_mortality_pct,
      targetHarvestAgeDays: b.target_harvest_age_days,
      status: b.status,
      flockAgeDays: b.flock_age_days,
      remarks: b.remarks,
      estimatedLiveBirds: b.estimated_live_birds || b.initial_chicks,
      livabilityPercentage: b.livability_percentage || 100.0,
    };
  }

  public static async closeBatch(batchId: number): Promise<BatchItem> {
    const b = await this.request<any>(`/batches/${batchId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Completed' }),
    });
    return {
      id: b.id,
      batchCode: b.batch_code,
      shedId: b.shed_id,
      shedName: b.shed_name || `Shed ${b.shed_id}`,
      breed: b.breed,
      placementDate: b.placement_date,
      closedDate: b.closed_date,
      initialChicks: b.initial_chicks,
      chickSupplier: b.chick_supplier,
      chickCostPerBird: b.chick_cost_per_bird,
      targetFcr: b.target_fcr,
      standardMortalityPct: b.standard_mortality_pct,
      targetHarvestAgeDays: b.target_harvest_age_days,
      status: b.status,
      flockAgeDays: b.flock_age_days,
      remarks: b.remarks,
      estimatedLiveBirds: b.estimated_live_birds || b.initial_chicks,
      livabilityPercentage: b.livability_percentage || 100.0,
    };
  }

  // --- DAILY FLOCK REGISTER ---
  public static async getDailyLogs(batchId?: number): Promise<DailyLogEntry[]> {
    const query = batchId ? `?batch_id=${batchId}` : '';
    const logs = await this.request<any[]>(`/daily-logs${query}`);
    return logs.map((l) => ({
      id: String(l.id),
      logDate: l.date,
      flockAgeDays: l.flock_age_days,
      dailyMortality: l.mortality_count,
      dailyFeedBags: l.feed_consumed_bags,
      dailyFeedKg: l.feed_consumed_kg,
      avgBodyWeightGrams: l.avg_weight_grams,
      waterConsumptionLitres: l.water_intake_liters,
      remarks: l.remarks,
    }));
  }

  public static async recordDailyLog(data: {
    batchId: number;
    date: string;
    mortalityCount: number;
    feedConsumedBags: number;
    avgWeightGrams?: number;
    waterIntakeLiters?: number;
    temperatureCelsius?: number;
    humidityPercent?: number;
    remarks?: string;
  }): Promise<DailyLogEntry> {
    const payload = {
      batch_id: data.batchId,
      date: data.date,
      mortality_count: data.mortalityCount,
      feed_consumed_bags: data.feedConsumedBags,
      avg_weight_grams: data.avgWeightGrams,
      water_intake_liters: data.waterIntakeLiters,
      temperature_celsius: data.temperatureCelsius,
      humidity_percent: data.humidityPercent,
      remarks: data.remarks,
    };
    const l = await this.request<any>('/daily-logs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      id: String(l.id),
      logDate: l.date,
      flockAgeDays: l.flock_age_days,
      dailyMortality: l.mortality_count,
      dailyFeedBags: l.feed_consumed_bags,
      dailyFeedKg: l.feed_consumed_kg,
      avgBodyWeightGrams: l.avg_weight_grams,
      waterConsumptionLitres: l.water_intake_liters,
      remarks: l.remarks,
    };
  }

  // --- FEED MANAGEMENT ---
  public static async getFeedOverview(batchId?: number): Promise<{
    currentStockBags: number;
    currentStockKg: number;
    starterBags: number;
    growerBags: number;
    finisherBags: number;
    transactions: FeedTransaction[];
  }> {
    const query = batchId ? `?batch_id=${batchId}` : '';
    const res = await this.request<any>(`/feed/overview${query}`);
    return {
      currentStockBags: res.current_stock_bags,
      currentStockKg: res.current_stock_kg,
      starterBags: res.starter_bags,
      growerBags: res.grower_bags,
      finisherBags: res.finisher_bags,
      transactions: (res.transactions || []).map((t: any) => ({
        id: String(t.id),
        transactionDate: t.transaction_date,
        feedType: t.feed_type,
        transactionType: t.transaction_type,
        bagsCount: t.bags_count,
        weightKgPerBag: t.weight_kg_per_bag,
        totalWeightKg: t.total_weight_kg,
        supplierName: t.supplier_name,
        supplierInvoiceNo: t.supplier_invoice_no,
        costPerBag: t.cost_per_bag,
        remarks: t.remarks,
      })),
    };
  }

  public static async recordFeedDelivery(data: {
    batchId: number;
    feedType: string;
    bagsCount: number;
    weightKgPerBag: number;
    costPerBag?: number;
    supplierName?: string;
    supplierInvoiceNo?: string;
    remarks?: string;
  }): Promise<FeedTransaction> {
    const payload = {
      batch_id: data.batchId,
      feed_type: data.feedType,
      transaction_type: 'Inward',
      bags_count: data.bagsCount,
      weight_kg_per_bag: data.weightKgPerBag,
      cost_per_bag: data.costPerBag,
      supplier_name: data.supplierName,
      supplier_invoice_no: data.supplierInvoiceNo,
      remarks: data.remarks,
    };
    const t = await this.request<any>('/feed/delivery', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      id: String(t.id),
      transactionDate: t.transaction_date,
      feedType: t.feed_type,
      transactionType: t.transaction_type,
      bagsCount: t.bags_count,
      weightKgPerBag: t.weight_kg_per_bag,
      totalWeightKg: t.total_weight_kg,
      supplierName: t.supplier_name,
      supplierInvoiceNo: t.supplier_invoice_no,
      costPerBag: t.cost_per_bag,
      remarks: t.remarks,
    };
  }

  // --- GROWTH & WEIGHT SAMPLES ---
  public static async getGrowthOverview(batchId: number): Promise<{
    currentAvgWeightGrams: number;
    breedTargetGrams: number;
    varianceGrams: number;
    uniformityPct: number;
    growthCurve: GrowthCurvePoint[];
    samples: WeightSampleItem[];
  }> {
    const res = await this.request<any>(`/growth/${batchId}`);
    return {
      currentAvgWeightGrams: res.current_avg_weight_grams,
      breedTargetGrams: res.breed_target_grams,
      varianceGrams: res.variance_from_standard_grams,
      uniformityPct: res.uniformity_pct,
      growthCurve: (res.growth_curve || []).map((c: any) => ({
        day: c.day,
        standardWeightGrams: c.standard_weight_grams,
        actualWeightGrams: c.actual_weight_grams,
        cumulativeFcr: c.cumulative_fcr,
        targetFcr: c.target_fcr,
      })),
      samples: (res.samples || []).map((s: any) => ({
        id: String(s.id),
        sampleDate: s.sample_date,
        flockAgeDays: s.flock_age_days,
        sampleBirdsCount: s.sample_birds_count,
        avgWeightGrams: s.avg_weight_grams,
        uniformityPct: s.uniformity_pct,
        breedStandardTargetGrams: s.breed_standard_target_grams,
        varianceGrams: s.variance_grams,
        computedCumulativeFcr: s.computed_cumulative_fcr,
        remarks: s.remarks,
      })),
    };
  }

  public static async recordWeightSample(data: {
    batchId: number;
    sampleDate: string;
    flockAgeDays: number;
    sampleBirdsCount: number;
    avgWeightGrams: number;
    uniformityPct?: number;
    remarks?: string;
  }): Promise<WeightSampleItem> {
    const payload = {
      batch_id: data.batchId,
      sample_date: data.sampleDate,
      flock_age_days: data.flockAgeDays,
      sample_birds_count: data.sampleBirdsCount,
      avg_weight_grams: data.avgWeightGrams,
      uniformity_pct: data.uniformityPct,
      remarks: data.remarks,
    };
    const s = await this.request<any>('/growth/samples', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      id: String(s.id),
      sampleDate: s.sample_date,
      flockAgeDays: s.flock_age_days,
      sampleBirdsCount: s.sample_birds_count,
      avgWeightGrams: s.avg_weight_grams,
      uniformityPct: s.uniformity_pct,
      breedStandardTargetGrams: s.breed_standard_target_grams,
      varianceGrams: s.variance_grams,
      computedCumulativeFcr: s.computed_cumulative_fcr,
      remarks: s.remarks,
    };
  }

  // --- HARVEST & LIFTING ---
  public static async getLiftingRecords(batchId?: number): Promise<LiftingSlipItem[]> {
    const query = batchId ? `?batch_id=${batchId}` : '';
    const records = await this.request<any[]>(`/harvest/liftings${query}`);
    return records.map((r) => ({
      id: String(r.id),
      slipNo: r.dc_slip_number,
      liftingDate: r.lifting_date,
      buyerName: r.buyer_name,
      vehicleNo: r.vehicle_number,
      cagesCount: 120,
      birdsCount: r.birds_count,
      grossWeightKg: r.gross_weight_kg,
      tareWeightKg: r.tare_weight_kg,
      netWeightKg: r.net_weight_kg,
      avgWeightKg: r.avg_bird_weight_kg,
      driverName: r.supervisor_name,
      remarks: r.remarks,
    }));
  }

  public static async recordLiftingSlip(data: {
    batchId: number;
    dcSlipNumber: string;
    liftingDate: string;
    buyerName: string;
    vehicleNumber: string;
    birdsCount: number;
    grossWeightKg: number;
    tareWeightKg: number;
    supervisorName?: string;
    destinationTrader?: string;
    remarks?: string;
  }): Promise<LiftingSlipItem> {
    const payload = {
      batch_id: data.batchId,
      dc_slip_number: data.dcSlipNumber,
      lifting_date: data.liftingDate,
      buyer_name: data.buyerName,
      vehicle_number: data.vehicleNumber,
      birds_count: data.birdsCount,
      gross_weight_kg: data.grossWeightKg,
      tare_weight_kg: data.tareWeightKg,
      supervisor_name: data.supervisorName,
      destination_trader: data.destinationTrader,
      remarks: data.remarks,
    };
    const r = await this.request<any>('/harvest/liftings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      id: String(r.id),
      slipNo: r.dc_slip_number,
      liftingDate: r.lifting_date,
      buyerName: r.buyer_name,
      vehicleNo: r.vehicle_number,
      cagesCount: 120,
      birdsCount: r.birds_count,
      grossWeightKg: r.gross_weight_kg,
      tareWeightKg: r.tare_weight_kg,
      netWeightKg: r.net_weight_kg,
      avgWeightKg: r.avg_bird_weight_kg,
      driverName: r.supervisor_name,
      remarks: r.remarks,
    };
  }

  // --- SETTLEMENT ---
  public static async getSettlement(batchId: number): Promise<SettlementVoucherItem | null> {
    try {
      const s = await this.request<any>(`/harvest/settlement/${batchId}`);
      return {
        id: s.id,
        batchId: s.batch_id,
        voucherNo: s.voucher_no,
        settlementDate: s.settlement_date,
        totalBirdsLifted: s.total_birds_lifted,
        totalNetWeightKg: s.total_net_weight_kg,
        actualFcr: s.actual_fcr,
        benchmarkFcr: s.benchmark_fcr,
        actualMortalityPct: s.actual_mortality_pct,
        standardMortalityPct: s.standard_mortality_pct,
        baseGcRatePerKg: s.base_gc_rate_per_kg,
        baseGrowingCharges: s.base_growing_charges,
        fcrIncentive: s.fcr_incentive,
        otherIncentives: s.other_incentives,
        mortalityDeduction: s.mortality_deduction,
        medicineDeduction: s.medicine_deduction,
        totalDeductions: s.total_deductions,
        netPayableAmount: s.net_payable_amount,
        status: s.status,
        remarks: s.remarks,
      };
    } catch {
      return null;
    }
  }

  public static async generateSettlement(
    batchId: number,
    params: {
      baseGcRatePerKg: number;
      otherIncentives: number;
      mortalityDeduction: number;
      medicineDeduction: number;
      remarks?: string;
    }
  ): Promise<SettlementVoucherItem> {
    const payload = {
      base_gc_rate_per_kg: params.baseGcRatePerKg,
      other_incentives: params.otherIncentives,
      mortality_deduction: params.mortalityDeduction,
      medicine_deduction: params.medicineDeduction,
      remarks: params.remarks,
    };
    const s = await this.request<any>(`/harvest/settlement/${batchId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      id: s.id,
      batchId: s.batch_id,
      voucherNo: s.voucher_no,
      settlementDate: s.settlement_date,
      totalBirdsLifted: s.total_birds_lifted,
      totalNetWeightKg: s.total_net_weight_kg,
      actualFcr: s.actual_fcr,
      benchmarkFcr: s.benchmark_fcr,
      actualMortalityPct: s.actual_mortality_pct,
      standardMortalityPct: s.standard_mortality_pct,
      baseGcRatePerKg: s.base_gc_rate_per_kg,
      baseGrowingCharges: s.base_growing_charges,
      fcrIncentive: s.fcr_incentive,
      otherIncentives: s.other_incentives,
      mortalityDeduction: s.mortality_deduction,
      medicineDeduction: s.medicine_deduction,
      totalDeductions: s.total_deductions,
      netPayableAmount: s.net_payable_amount,
      status: s.status,
      remarks: s.remarks,
    };
  }

  public static async updateSettlementStatus(
    settlementId: number | string,
    status: 'Draft' | 'Approved' | 'Paid'
  ): Promise<SettlementVoucherItem> {
    const s = await this.request<any>(`/harvest/settlement/${settlementId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return {
      id: s.id,
      batchId: s.batch_id,
      voucherNo: s.voucher_no,
      settlementDate: s.settlement_date,
      totalBirdsLifted: s.total_birds_lifted,
      totalNetWeightKg: s.total_net_weight_kg,
      actualFcr: s.actual_fcr,
      benchmarkFcr: s.benchmark_fcr,
      actualMortalityPct: s.actual_mortality_pct,
      standardMortalityPct: s.standard_mortality_pct,
      baseGcRatePerKg: s.base_gc_rate_per_kg,
      baseGrowingCharges: s.base_growing_charges,
      fcrIncentive: s.fcr_incentive,
      otherIncentives: s.other_incentives,
      mortalityDeduction: s.mortality_deduction,
      medicineDeduction: s.medicine_deduction,
      totalDeductions: s.total_deductions,
      netPayableAmount: s.net_payable_amount,
      status: s.status,
      remarks: s.remarks,
    };
  }
}
