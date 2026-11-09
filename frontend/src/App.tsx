import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  AlertTriangle,
  Wheat,
  Scale,
  Activity,
  Award,
  Truck,
  IndianRupee,
  Sparkles,
} from 'lucide-react';

import { DemoBanner } from './components/ui/DemoBanner';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ActiveBatchBanner } from './components/dashboard/ActiveBatchBanner';
import { MetricCard } from './components/dashboard/MetricCard';
import { ShedCard } from './components/dashboard/ShedCard';
import { RecentLogsTable } from './components/dashboard/RecentLogsTable';
import { LiftingRegisterTable } from './components/dashboard/LiftingRegisterTable';
import { SettlementProjectionCard } from './components/dashboard/SettlementProjectionCard';
import { DailyRegisterModal } from './components/dashboard/DailyRegisterModal';
import { BatchManagementView } from './components/batches/BatchManagementView';
import { DailyRegisterView } from './components/dailyRegister/DailyRegisterView';
import { FeedManagementView } from './components/feed/FeedManagementView';
import { WeightAndFcrView } from './components/growth/WeightAndFcrView';
import { LiftingView } from './components/harvest/LiftingView';
import { SettlementView } from './components/harvest/SettlementView';
import { LoginModal } from './components/auth/LoginModal';

import { ApiService, UserProfile } from './services/api';
import {
  DEMO_ACTIVE_BATCH,
  DEMO_SHEDS,
  DEMO_DAILY_LOGS,
  DEMO_LIFTING_RECORDS,
} from './data/demoData';
import { DailyLogEntry, ActiveBatchMetrics, ShedSummary } from './types/dashboard';
import { BatchItem, CreateBatchInput } from './types/batch';
import { FeedTransaction } from './types/feed';
import { WeightSampleItem } from './types/growth';
import { LiftingSlipItem, SettlementVoucherItem } from './types/harvest';

const INITIAL_WEIGHT_SAMPLES: WeightSampleItem[] = [
  {
    id: 'ws-5',
    sampleDate: '2026-05-09',
    flockAgeDays: 35,
    sampleBirdsCount: 100,
    avgWeightGrams: 1980,
    uniformityPct: 86.5,
    breedStandardTargetGrams: 2240,
    varianceGrams: -260,
    computedCumulativeFcr: 1.562,
    remarks: 'Sample across 3 random catch frames',
  },
  {
    id: 'ws-4',
    sampleDate: '2026-05-02',
    flockAgeDays: 28,
    sampleBirdsCount: 100,
    avgWeightGrams: 1620,
    uniformityPct: 88.0,
    breedStandardTargetGrams: 1590,
    varianceGrams: 30,
    computedCumulativeFcr: 1.42,
    remarks: 'Growth frame developing well on Finisher',
  },
  {
    id: 'ws-3',
    sampleDate: '2026-04-25',
    flockAgeDays: 21,
    sampleBirdsCount: 100,
    avgWeightGrams: 1040,
    uniformityPct: 87.5,
    breedStandardTargetGrams: 1010,
    varianceGrams: 30,
    computedCumulativeFcr: 1.30,
    remarks: 'Transition from Starter to Finisher pellets',
  },
  {
    id: 'ws-2',
    sampleDate: '2026-04-18',
    flockAgeDays: 14,
    sampleBirdsCount: 100,
    avgWeightGrams: 530,
    uniformityPct: 85.0,
    breedStandardTargetGrams: 510,
    varianceGrams: 20,
    computedCumulativeFcr: 1.16,
    remarks: 'Starter pellets feed conversion optimal',
  },
  {
    id: 'ws-1',
    sampleDate: '2026-04-11',
    flockAgeDays: 7,
    sampleBirdsCount: 100,
    avgWeightGrams: 215,
    uniformityPct: 89.0,
    breedStandardTargetGrams: 205,
    varianceGrams: 10,
    computedCumulativeFcr: 0.94,
    remarks: 'Pre-starter crumb intake excellent, low 7-day mortality',
  },
];

const INITIAL_FEED_TRANSACTIONS: FeedTransaction[] = [
  {
    id: 'tx-1',
    transactionDate: '2026-05-08',
    feedType: 'Finisher',
    transactionType: 'Inward',
    bagsCount: 100,
    weightKgPerBag: 50,
    totalWeightKg: 5000,
    supplierName: 'Godrej Agrovet Feed Mill',
    supplierInvoiceNo: 'INV-2026-8801',
    costPerBag: 2150,
    remarks: 'Lot #FN-99 received in good condition',
  },
  {
    id: 'tx-2',
    transactionDate: '2026-05-09',
    feedType: 'Finisher',
    transactionType: 'Consumption',
    bagsCount: 9,
    weightKgPerBag: 50,
    totalWeightKg: 450,
    remarks: 'Shed 1 daily flock feeding',
  },
  {
    id: 'tx-3',
    transactionDate: '2026-05-10',
    feedType: 'Finisher',
    transactionType: 'Consumption',
    bagsCount: 8.5,
    weightKgPerBag: 50,
    totalWeightKg: 425,
    remarks: 'Shed 1 daily flock feeding',
  },
];

const INITIAL_BATCHES: BatchItem[] = [
  {
    id: 101,
    batchCode: 'BATCH-2026-03-A',
    shedId: 1,
    shedName: 'Shed 1 — North Commercial',
    breed: 'Cobb 500 Broiler',
    placementDate: '2026-04-04',
    initialChicks: 5000,
    chickSupplier: 'Venkateshwara Hatcheries Ltd (Vencobb)',
    chickCostPerBird: 38.0,
    targetFcr: 1.60,
    standardMortalityPct: 5.0,
    targetHarvestAgeDays: 40,
    status: 'Active',
    flockAgeDays: 36,
    remarks: 'Brooding with automatic gas brooders. First lifting of 2,100 birds completed.',
    estimatedLiveBirds: 4858,
    livabilityPercentage: 97.16,
  },
  {
    id: 102,
    batchCode: 'BATCH-2026-03-B',
    shedId: 2,
    shedName: 'Shed 2 — South Broiler Unit',
    breed: 'Ross 308',
    placementDate: '2026-04-22',
    initialChicks: 6000,
    chickSupplier: 'Suguna Breeders Ltd',
    chickCostPerBird: 39.5,
    targetFcr: 1.58,
    standardMortalityPct: 4.5,
    targetHarvestAgeDays: 38,
    status: 'Active',
    flockAgeDays: 18,
    remarks: 'Grower feed transition initiated at Day 15.',
    estimatedLiveBirds: 5880,
    livabilityPercentage: 98.0,
  },
  {
    id: 99,
    batchCode: 'BATCH-2026-02-C',
    shedId: 3,
    shedName: 'Shed 3 — East Environmentally Controlled',
    breed: 'Cobb 500',
    placementDate: '2026-02-15',
    closedDate: '2026-03-28',
    initialChicks: 8000,
    chickSupplier: 'IB Group Hatcheries',
    chickCostPerBird: 37.0,
    targetFcr: 1.55,
    standardMortalityPct: 5.0,
    targetHarvestAgeDays: 42,
    status: 'Completed',
    flockAgeDays: 41,
    remarks: 'Full lifting concluded with average 2.24 kg weight and FCR 1.54.',
    estimatedLiveBirds: 7712,
    livabilityPercentage: 96.4,
  },
];

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [selectedShedId, setSelectedShedId] = useState<number | 'all'>('all');

  // Backend Connectivity & Auth State
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return (
      ApiService.getStoredUser() || {
        id: 1,
        username: 'owner',
        full_name: 'Tejas D. (Farm Owner)',
        role: 'Owner',
      }
    );
  });

  // Business Domain State
  const [activeBatch, setActiveBatch] = useState<ActiveBatchMetrics>(DEMO_ACTIVE_BATCH);
  const [dailyLogs, setDailyLogs] = useState<DailyLogEntry[]>(DEMO_DAILY_LOGS);
  const [sheds, setSheds] = useState<ShedSummary[]>(DEMO_SHEDS);
  const [batches, setBatches] = useState<BatchItem[]>(INITIAL_BATCHES);
  const [feedTransactions, setFeedTransactions] = useState<FeedTransaction[]>(INITIAL_FEED_TRANSACTIONS);
  const [weightSamples, setWeightSamples] = useState<WeightSampleItem[]>(INITIAL_WEIGHT_SAMPLES);
  const [liftingSlips, setLiftingSlips] = useState<LiftingSlipItem[]>(DEMO_LIFTING_RECORDS);
  const [settlementVoucher, setSettlementVoucher] = useState<SettlementVoucherItem | null>({
    id: 1,
    batchId: 101,
    voucherNo: 'GC-BATCH-2026-03-A-FINAL',
    settlementDate: '2026-05-10',
    totalBirdsLifted: 2100,
    totalNetWeightKg: 4220,
    actualFcr: 1.562,
    benchmarkFcr: 1.60,
    actualMortalityPct: 2.84,
    standardMortalityPct: 5.0,
    baseGcRatePerKg: 12.50,
    baseGrowingCharges: 52750,
    fcrIncentive: 80.18,
    otherIncentives: 1200,
    mortalityDeduction: 0,
    medicineDeduction: 350,
    totalDeductions: 350,
    netPayableAmount: 53680,
    status: 'Approved',
    remarks: 'Full batch early lifting bonus applied',
  });

  // Sync with live backend if online
  const checkAndSyncBackend = useCallback(async () => {
    const health = await ApiService.checkHealth();
    setBackendOnline(health.online);

    if (health.online) {
      try {
        // Fetch real database records in parallel
        const [dashRes, batchesRes, logsRes] = await Promise.allSettled([
          ApiService.getDashboardOverview(),
          ApiService.getBatches(),
          ApiService.getDailyLogs(),
        ]);

        if (dashRes.status === 'fulfilled') {
          setActiveBatch(dashRes.value.activeBatch);
          if (dashRes.value.sheds.length > 0) {
            setSheds(dashRes.value.sheds);
          }
        }

        if (batchesRes.status === 'fulfilled' && batchesRes.value.length > 0) {
          setBatches(batchesRes.value);
        }

        if (logsRes.status === 'fulfilled' && logsRes.value.length > 0) {
          setDailyLogs(logsRes.value);
        }
      } catch (err) {
        console.warn('Backend sync encountered an issue, retaining local cache:', err);
      }
    }
  }, []);

  useEffect(() => {
    checkAndSyncBackend();
    const interval = setInterval(checkAndSyncBackend, 30000);
    return () => clearInterval(interval);
  }, [checkAndSyncBackend]);

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    checkAndSyncBackend();
  };

  const handleLogout = () => {
    ApiService.clearAuth();
    setCurrentUser(null);
  };

  // Handle new lifting slip
  const handleAddLiftingSlip = async (slip: LiftingSlipItem) => {
    setLiftingSlips((prev) => [slip, ...prev]);

    // Persist to backend if online
    if (backendOnline && activeBatch.batchId) {
      try {
        await ApiService.recordLiftingSlip({
          batchId: activeBatch.batchId,
          dcSlipNumber: slip.slipNo,
          liftingDate: slip.liftingDate,
          buyerName: slip.buyerName,
          vehicleNumber: slip.vehicleNo,
          birdsCount: slip.birdsCount,
          grossWeightKg: slip.grossWeightKg,
          tareWeightKg: slip.tareWeightKg,
          supervisorName: slip.driverName,
          destinationTrader: slip.buyerName,
          remarks: 'Lifting slip logged via web dashboard',
        });
      } catch (e) {
        console.warn('Backend sync error for lifting slip:', e);
      }
    }

    // Update active batch lifted and remaining birds
    setActiveBatch((prev) => {
      const newLifted = prev.totalBirdsLifted + slip.birdsCount;
      const liveFlock = prev.initialChicks - prev.cumulativeMortality;
      const newRemaining = Math.max(0, liveFlock - newLifted);

      return {
        ...prev,
        totalBirdsLifted: newLifted,
        remainingBirds: newRemaining,
      };
    });
  };

  // Handle saving settlement voucher
  const handleSaveVoucher = async (voucher: SettlementVoucherItem) => {
    setSettlementVoucher(voucher);
    setActiveBatch((prev) => ({
      ...prev,
      estimatedGrowingCharges: voucher.netPayableAmount,
      settlementStatus: voucher.status === 'Paid' ? 'Settled' : 'In Progress',
    }));

    if (backendOnline && activeBatch.batchId) {
      try {
        await ApiService.generateSettlement(activeBatch.batchId, {
          baseGcRatePerKg: voucher.baseGcRatePerKg,
          otherIncentives: voucher.otherIncentives,
          mortalityDeduction: voucher.mortalityDeduction,
          medicineDeduction: voucher.medicineDeduction,
          remarks: voucher.remarks,
        });
      } catch (e) {
        console.warn('Backend sync error for settlement:', e);
      }
    }
  };

  // Handle marking voucher as paid
  const handleMarkPaid = async () => {
    if (settlementVoucher) {
      const updatedVoucher = { ...settlementVoucher, status: 'Paid' as const };
      setSettlementVoucher(updatedVoucher);
      setActiveBatch((prev) => ({ ...prev, settlementStatus: 'Settled' }));

      if (backendOnline && settlementVoucher.id) {
        try {
          await ApiService.updateSettlementStatus(settlementVoucher.id, 'Paid');
        } catch (e) {
          console.warn('Backend sync error for settlement status update:', e);
        }
      }
    }
  };

  // Handle new weight sample
  const handleAddWeightSample = async (sample: Omit<WeightSampleItem, 'id'>) => {
    const newSample: WeightSampleItem = {
      ...sample,
      id: Date.now().toString(),
    };
    setWeightSamples((prev) => [newSample, ...prev]);

    if (backendOnline && activeBatch.batchId) {
      try {
        await ApiService.recordWeightSample({
          batchId: activeBatch.batchId,
          sampleDate: sample.sampleDate,
          flockAgeDays: sample.flockAgeDays,
          sampleBirdsCount: sample.sampleBirdsCount,
          avgWeightGrams: sample.avgWeightGrams,
          uniformityPct: sample.uniformityPct,
          remarks: sample.remarks,
        });
      } catch (e) {
        console.warn('Backend sync error for weight sample:', e);
      }
    }

    // Update active batch average weight
    setActiveBatch((prev) => {
      const newWeightKg = sample.avgWeightGrams / 1000;
      const totalLiveWeight = prev.estimatedLiveBirds * newWeightKg;
      const newFcr = totalLiveWeight > 0 ? Math.round((prev.totalFeedConsumedKg / totalLiveWeight) * 1000) / 1000 : prev.currentFcr;

      return {
        ...prev,
        avgBodyWeightKg: newWeightKg,
        currentFcr: newFcr,
        isFcrFavorable: newFcr <= 1.60,
      };
    });
  };

  // Handle new inward feed delivery
  const handleAddFeedTransaction = async (tx: Omit<FeedTransaction, 'id'>) => {
    const newTx: FeedTransaction = {
      ...tx,
      id: Date.now().toString(),
    };
    setFeedTransactions((prev) => [newTx, ...prev]);

    if (backendOnline && activeBatch.batchId) {
      try {
        await ApiService.recordFeedDelivery({
          batchId: activeBatch.batchId,
          feedType: tx.feedType,
          bagsCount: tx.bagsCount,
          weightKgPerBag: tx.weightKgPerBag,
          costPerBag: tx.costPerBag,
          supplierName: tx.supplierName,
          supplierInvoiceNo: tx.supplierInvoiceNo,
          remarks: tx.remarks,
        });
      } catch (e) {
        console.warn('Backend sync error for feed transaction:', e);
      }
    }
  };

  // Handle new daily flock entry submission
  const handleSaveDailyEntry = async (entry: DailyLogEntry) => {
    setDailyLogs((prev) => [entry, ...prev]);

    if (backendOnline && activeBatch.batchId) {
      try {
        await ApiService.recordDailyLog({
          batchId: activeBatch.batchId,
          date: entry.logDate,
          mortalityCount: entry.dailyMortality,
          feedConsumedBags: entry.dailyFeedBags,
          avgWeightGrams: entry.avgBodyWeightGrams,
          waterIntakeLiters: entry.waterConsumptionLitres,
          remarks: entry.remarks,
        });
      } catch (e) {
        console.warn('Backend sync error for daily log:', e);
      }
    }

    // Automatically update active batch live statistics
    setActiveBatch((prev) => {
      const newCumulativeMortality = prev.cumulativeMortality + entry.dailyMortality;
      const newEstimatedLive = prev.initialChicks - newCumulativeMortality;
      const newTotalFeed = prev.totalFeedConsumedKg + entry.dailyFeedKg;
      const newMortalityPct = Math.round((newCumulativeMortality / prev.initialChicks) * 10000) / 100;
      const newLivabilityPct = Math.round((100 - newMortalityPct) * 100) / 100;

      const newAvgWeightKg = entry.avgBodyWeightGrams
        ? entry.avgBodyWeightGrams / 1000
        : prev.avgBodyWeightKg;

      const totalLiveWeight = newEstimatedLive * newAvgWeightKg;
      const newFcr = totalLiveWeight > 0 ? Math.round((newTotalFeed / totalLiveWeight) * 1000) / 1000 : prev.currentFcr;

      const epefDenominator = entry.flockAgeDays * newFcr;
      const newEpef = epefDenominator > 0
        ? Math.round((newLivabilityPct * newAvgWeightKg * 10000) / epefDenominator) / 100
        : prev.epef;

      return {
        ...prev,
        flockAgeDays: entry.flockAgeDays,
        cumulativeMortality: newCumulativeMortality,
        estimatedLiveBirds: newEstimatedLive,
        remainingBirds: Math.max(0, newEstimatedLive - prev.totalBirdsLifted),
        mortalityPercentage: newMortalityPct,
        livabilityPercentage: newLivabilityPct,
        totalFeedConsumedKg: newTotalFeed,
        avgBodyWeightKg: newAvgWeightKg,
        currentFcr: newFcr,
        isFcrFavorable: newFcr <= 1.60,
        epef: newEpef,
      };
    });
  };

  // Handle New Batch Creation
  const handleCreateBatch = async (input: CreateBatchInput) => {
    const assignedShed = sheds.find((s) => s.id === input.shedId);
    let createdBatchItem: BatchItem;

    if (backendOnline) {
      try {
        createdBatchItem = await ApiService.createBatch(input);
      } catch (e) {
        console.warn('Backend creation failed, falling back to local state:', e);
        createdBatchItem = {
          id: Date.now(),
          batchCode: input.batchCode,
          shedId: input.shedId,
          shedName: assignedShed ? assignedShed.name : `Shed ${input.shedId}`,
          breed: input.breed,
          placementDate: input.placementDate,
          initialChicks: input.initialChicks,
          chickSupplier: input.chickSupplier,
          chickCostPerBird: input.chickCostPerBird,
          targetFcr: input.targetFcr,
          standardMortalityPct: input.standardMortalityPct,
          targetHarvestAgeDays: input.targetHarvestAgeDays,
          status: 'Active',
          flockAgeDays: 1,
          remarks: input.remarks,
          estimatedLiveBirds: input.initialChicks,
          livabilityPercentage: 100.0,
        };
      }
    } else {
      createdBatchItem = {
        id: Date.now(),
        batchCode: input.batchCode,
        shedId: input.shedId,
        shedName: assignedShed ? assignedShed.name : `Shed ${input.shedId}`,
        breed: input.breed,
        placementDate: input.placementDate,
        initialChicks: input.initialChicks,
        chickSupplier: input.chickSupplier,
        chickCostPerBird: input.chickCostPerBird,
        targetFcr: input.targetFcr,
        standardMortalityPct: input.standardMortalityPct,
        targetHarvestAgeDays: input.targetHarvestAgeDays,
        status: 'Active',
        flockAgeDays: 1,
        remarks: input.remarks,
        estimatedLiveBirds: input.initialChicks,
        livabilityPercentage: 100.0,
      };
    }

    setBatches((prev) => [createdBatchItem, ...prev]);

    // Update corresponding shed to Active with new batch code
    setSheds((prev) =>
      prev.map((s) =>
        s.id === input.shedId
          ? {
              ...s,
              status: 'Active',
              activeBatchCode: input.batchCode,
              flockAgeDays: 1,
              liveBirds: input.initialChicks,
              mortalityPct: 0.0,
              currentFcr: 0.0,
            }
          : s
      )
    );
  };

  // Handle Batch Closing (Historical Record archive)
  const handleCloseBatch = async (batchId: number) => {
    if (backendOnline) {
      try {
        await ApiService.closeBatch(batchId);
      } catch (e) {
        console.warn('Backend close batch error:', e);
      }
    }

    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              status: 'Completed',
              closedDate: new Date().toISOString().split('T')[0],
            }
          : b
      )
    );

    // Free up shed status to Sanitizing
    const closed = batches.find((b) => b.id === batchId);
    if (closed) {
      setSheds((prev) =>
        prev.map((s) =>
          s.id === closed.shedId
            ? {
                ...s,
                status: 'Sanitizing',
                activeBatchCode: undefined,
                flockAgeDays: undefined,
                liveBirds: undefined,
                mortalityPct: undefined,
                currentFcr: undefined,
              }
            : s
        )
      );
    }
  };

  // Handle log deletion
  const handleDeleteLog = (logId: number) => {
    const deleted = dailyLogs.find((l) => String(l.id) === String(logId));
    setDailyLogs((prev) => prev.filter((l) => String(l.id) !== String(logId)));

    if (deleted) {
      setActiveBatch((prev) => {
        const newCumulativeMortality = Math.max(0, prev.cumulativeMortality - deleted.dailyMortality);
        const newEstimatedLive = prev.initialChicks - newCumulativeMortality;
        const newMortalityPct = Math.round((newCumulativeMortality / prev.initialChicks) * 10000) / 100;
        const newLivabilityPct = Math.round((100 - newMortalityPct) * 100) / 100;

        return {
          ...prev,
          cumulativeMortality: newCumulativeMortality,
          estimatedLiveBirds: newEstimatedLive,
          remainingBirds: Math.max(0, newEstimatedLive - prev.totalBirdsLifted),
          mortalityPercentage: newMortalityPct,
          livabilityPercentage: newLivabilityPct,
        };
      });
    }
  };

  const filteredSheds = selectedShedId === 'all'
    ? sheds
    : sheds.filter((s) => s.id === selectedShedId);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Banner with Backend Status */}
        <DemoBanner backendOnline={backendOnline} />

        {/* Top Header Navbar */}
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenDailyModal={() => setIsDailyModalOpen(true)}
          selectedShedId={selectedShedId}
          setSelectedShedId={setSelectedShedId}
          sheds={sheds}
          backendOnline={backendOnline}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Dynamic Route View Switcher */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {currentTab === 'batches' ? (
            /* Module 1: Batch Management View */
            <BatchManagementView
              batches={batches}
              sheds={sheds}
              onCreateBatch={handleCreateBatch}
              onCloseBatch={handleCloseBatch}
            />
          ) : currentTab === 'daily-register' ? (
            /* Module 2: Daily Flock Register View */
            <DailyRegisterView
              logs={dailyLogs}
              activeBatch={activeBatch}
              onOpenModal={() => setIsDailyModalOpen(true)}
              onDeleteLog={handleDeleteLog}
            />
          ) : currentTab === 'feed' ? (
            /* Module 3: Feed Management View */
            <FeedManagementView
              transactions={feedTransactions}
              onAddTransaction={handleAddFeedTransaction}
              dailyConsumptionBags={8.5}
            />
          ) : currentTab === 'weight' ? (
            /* Module 4 & 5: Weight Tracking & FCR Growth View */
            <WeightAndFcrView
              activeBatch={activeBatch}
              samples={weightSamples}
              onAddSample={handleAddWeightSample}
            />
          ) : currentTab === 'lifting' ? (
            /* Module 6: Bird Lifting Records View */
            <LiftingView
              slips={liftingSlips}
              activeBatch={activeBatch}
              onAddSlip={handleAddLiftingSlip}
            />
          ) : currentTab === 'settlement' ? (
            /* Module 7: Payment and Settlement View */
            <SettlementView
              voucher={settlementVoucher}
              activeBatch={activeBatch}
              totalLiftedWeightKg={liftingSlips.reduce((acc, c) => acc + c.netWeightKg, 0)}
              totalBirdsLifted={liftingSlips.reduce((acc, c) => acc + c.birdsCount, 0)}
              onSaveVoucher={handleSaveVoucher}
              onMarkPaid={handleMarkPaid}
            />
          ) : (
            /* Executive Dashboard View */
            <>
              {/* Active Batch Summary Banner */}
              <ActiveBatchBanner batch={activeBatch} />

              {/* Sheds Overview Grid */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Shed Facility Status ({sheds.length} Units)
                  </h2>
                  {selectedShedId !== 'all' && (
                    <button
                      onClick={() => setSelectedShedId('all')}
                      className="text-xs font-semibold text-farm-700 hover:text-farm-800 hover:underline"
                    >
                      Show All Sheds
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredSheds.map((shed) => (
                    <ShedCard
                      key={shed.id}
                      shed={shed}
                      isSelected={selectedShedId === shed.id}
                      onSelect={() => setSelectedShedId(shed.id)}
                    />
                  ))}
                </div>
              </section>

              {/* Core Key Performance Indicators (KPIs) */}
              <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Flock Performance & Health Metrics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Estimated Live Birds */}
                  <MetricCard
                    title="Live Birds Count"
                    value={activeBatch.estimatedLiveBirds.toLocaleString()}
                    unit={`/ ${activeBatch.initialChicks.toLocaleString()}`}
                    subtitle={`Initial placement: ${activeBatch.initialChicks.toLocaleString()} DOC`}
                    icon={Users}
                    trend={{
                      value: `${activeBatch.livabilityPercentage}% Livability`,
                      isPositive: true,
                    }}
                    highlight="default"
                  />

                  {/* Cumulative Mortality */}
                  <MetricCard
                    title="Cumulative Mortality"
                    value={activeBatch.cumulativeMortality.toLocaleString()}
                    unit={`birds (${activeBatch.mortalityPercentage}%)`}
                    subtitle={`Allowable limit: 5.00% (${Math.round(activeBatch.initialChicks * 0.05)} birds)`}
                    icon={AlertTriangle}
                    trend={{
                      value: activeBatch.mortalityPercentage <= 5.0 ? 'Within Benchmark' : 'High Alert',
                      isPositive: activeBatch.mortalityPercentage <= 5.0,
                    }}
                    highlight={activeBatch.mortalityPercentage <= 5.0 ? 'success' : 'alert'}
                  />

                  {/* Feed Intake */}
                  <MetricCard
                    title="Total Feed Consumed"
                    value={activeBatch.totalFeedConsumedKg.toLocaleString()}
                    unit="kg"
                    subtitle={`${Math.round(activeBatch.totalFeedConsumedKg / 50).toLocaleString()} bags (50kg each)`}
                    icon={Wheat}
                    trend={{
                      value: 'Daily: 8.5 bags',
                    }}
                    highlight="default"
                  />

                  {/* Average Body Weight */}
                  <MetricCard
                    title="Average Body Weight"
                    value={(activeBatch.avgBodyWeightKg ?? 1.980).toFixed(3)}
                    unit="kg"
                    subtitle="Sample: 100 birds weighed (Day 35)"
                    icon={Scale}
                    trend={{
                      value: '+30g vs Breed Std',
                      isPositive: true,
                    }}
                    highlight="success"
                  />
                </div>
              </section>

              {/* Secondary KPIs: FCR, EPEF, Lifting Balance, Growing Charges */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Current FCR */}
                <MetricCard
                  title="Feed Conversion Ratio (FCR)"
                  value={(activeBatch.currentFcr ?? 1.60).toFixed(3)}
                  subtitle="Benchmark target: 1.600"
                  icon={Activity}
                  trend={{
                    value: activeBatch.isFcrFavorable ? 'Favorable FCR' : 'Above Target',
                    isPositive: activeBatch.isFcrFavorable,
                  }}
                  highlight={activeBatch.isFcrFavorable ? 'success' : 'alert'}
                />

                {/* European Production Efficiency Factor (EPEF) */}
                <MetricCard
                  title="EPEF Index"
                  value={Math.round(activeBatch.epef)}
                  subtitle="Industry standard: >300 Good, >350 Excellent"
                  icon={Award}
                  trend={{
                    value: 'Top Tier 95%',
                    isPositive: true,
                  }}
                  highlight="success"
                />

                {/* Harvesting / Lifting Count */}
                <MetricCard
                  title="Remaining in Shed"
                  value={activeBatch.remainingBirds.toLocaleString()}
                  unit="birds"
                  subtitle={`${activeBatch.totalBirdsLifted.toLocaleString()} birds lifted (${Math.round((activeBatch.totalBirdsLifted / (activeBatch.initialChicks - activeBatch.cumulativeMortality)) * 100)}%)`}
                  icon={Truck}
                  trend={{
                    value: 'Lifting Ongoing',
                  }}
                  highlight="default"
                />

                {/* Estimated Growing Charges */}
                <MetricCard
                  title="Estimated Growing Charges"
                  value={`₹${activeBatch.estimatedGrowingCharges.toLocaleString()}`}
                  subtitle="Includes FCR performance bonus"
                  icon={IndianRupee}
                  trend={{
                    value: activeBatch.settlementStatus,
                  }}
                  highlight="success"
                />
              </section>

              {/* Operation Tables & Settlement Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Flock Register Table (2 Cols on Large) */}
                <div className="lg:col-span-2 space-y-6">
                  <RecentLogsTable
                    logs={dailyLogs}
                    onOpenModal={() => setIsDailyModalOpen(true)}
                  />

                  <LiftingRegisterTable
                    records={liftingSlips}
                    totalLiveBeforeLifting={activeBatch.initialChicks - activeBatch.cumulativeMortality}
                  />
                </div>

                {/* Settlement Projections & Grower Earnings Card */}
                <div className="lg:col-span-1 space-y-6">
                  <SettlementProjectionCard
                    netWeightKg={liftingSlips.reduce((acc, c) => acc + c.netWeightKg, 0)}
                    baseRatePerKg={12.50}
                    actualFcr={activeBatch.currentFcr}
                    benchmarkFcr={1.60}
                    status={activeBatch.settlementStatus}
                  />

                  {/* Quick Batch Settings & Formula Info Card */}
                  <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-farm-50 text-farm-700">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Standard Farm Parameters
                      </h3>
                    </div>
                    <div className="text-xs space-y-2 text-slate-600">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Integrator / Company</span>
                        <span className="font-semibold text-slate-800">Suguna / Venkys Integration</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Contract Benchmark FCR</span>
                        <span className="font-semibold text-slate-800">1.600</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Standard Mortality Allowance</span>
                        <span className="font-semibold text-slate-800">5.0%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Standard Feed Bag Weight</span>
                        <span className="font-semibold text-slate-800">50 kg / bag</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Target Harvest Age</span>
                        <span className="font-semibold text-slate-800">38 - 42 Days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Farmer Daily Entry Modal */}
      <DailyRegisterModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        onSave={handleSaveDailyEntry}
        flockAgeDays={activeBatch.flockAgeDays}
        liveBirdsCount={activeBatch.remainingBirds}
        batchCode={activeBatch.batchCode}
      />

      {/* User Login & Role Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        backendOnline={backendOnline}
      />
    </div>
  );
};
