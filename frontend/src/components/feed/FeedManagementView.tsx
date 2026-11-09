import React, { useState } from 'react';
import {
  Wheat,
  Plus,
  AlertTriangle,
  Clock,
  Search,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { FeedTransaction, FeedStockSummary } from '../../types/feed';
import { RecordFeedDeliveryModal } from './RecordFeedDeliveryModal';

interface FeedManagementViewProps {
  transactions: FeedTransaction[];
  onAddTransaction: (tx: Omit<FeedTransaction, 'id'>) => void;
  dailyConsumptionBags: number;
}

const DEFAULT_STOCKS: FeedStockSummary[] = [
  {
    feedType: 'Pre-Starter',
    stageDescription: 'High-protein starter crumbs (22-23% CP)',
    targetFlockAge: 'Day 1 to 10',
    currentStockBags: 35.0,
    currentStockKg: 1750,
    stockStatus: 'Adequate',
    estimatedDaysLeft: 12.0,
  },
  {
    feedType: 'Starter',
    stageDescription: 'Growth & skeletal frame pellets (20-21% CP)',
    targetFlockAge: 'Day 11 to 20',
    currentStockBags: 22.0,
    currentStockKg: 1100,
    stockStatus: 'Low Stock',
    estimatedDaysLeft: 2.8,
  },
  {
    feedType: 'Finisher',
    stageDescription: 'High-energy finishing pellets (18-19% CP)',
    targetFlockAge: 'Day 21 to Harvest',
    currentStockBags: 110.0,
    currentStockKg: 5500,
    stockStatus: 'Adequate',
    estimatedDaysLeft: 12.9,
  },
];

export const FeedManagementView: React.FC<FeedManagementViewProps> = ({
  transactions,
  onAddTransaction,
  dailyConsumptionBags = 8.5,
}) => {
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'All' | 'Inward' | 'Consumption'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Dynamically recalculate live stock from transactions
  const stocks: FeedStockSummary[] = DEFAULT_STOCKS.map((def) => {
    const inward = transactions
      .filter((t) => t.feedType === def.feedType && t.transactionType === 'Inward')
      .reduce((acc, c) => acc + c.bagsCount, 0);

    const consumed = transactions
      .filter((t) => t.feedType === def.feedType && t.transactionType === 'Consumption')
      .reduce((acc, c) => acc + c.bagsCount, 0);

    const currentBags = Math.max(0, def.currentStockBags + inward - consumed);
    const currentKg = currentBags * 50;

    const daysLeft = dailyConsumptionBags > 0 ? Math.round((currentBags / dailyConsumptionBags) * 10) / 10 : 0;

    let stockStatus: 'Adequate' | 'Low Stock' | 'Critical' = 'Adequate';
    if (currentBags < 15) {
      stockStatus = 'Critical';
    } else if (currentBags < 30) {
      stockStatus = 'Low Stock';
    }

    return {
      ...def,
      currentStockBags: currentBags,
      currentStockKg: currentKg,
      stockStatus,
      estimatedDaysLeft: daysLeft,
    };
  });

  const totalWarehouseBags = stocks.reduce((acc, s) => acc + s.currentStockBags, 0);
  const totalWarehouseTonnes = (totalWarehouseBags * 50) / 1000;
  const overallDaysLeft = dailyConsumptionBags > 0 ? (totalWarehouseBags / dailyConsumptionBags).toFixed(1) : '0';

  const lowStockAlerts = stocks.filter((s) => s.stockStatus !== 'Adequate');

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== 'All' && tx.transactionType !== filterType) return false;
    if (searchTerm) {
      const matchSearch =
        tx.feedType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.supplierName && tx.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.supplierInvoiceNo && tx.supplierInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchSearch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-farm-50 text-farm-700">
              <Wheat className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Feed Management & Warehouse Stock
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Track Pre-Starter, Starter, and Finisher inventory, inward deliveries, and consumption rates.
          </p>
        </div>

        <button
          onClick={() => setIsDeliveryModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-farm-700 hover:bg-farm-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-farm-600 focus:ring-offset-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Feed Delivery</span>
        </button>
      </div>

      {/* Low Stock Warning Alert Banner */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start space-x-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-bold">Reorder Alert: </span>
            {lowStockAlerts.map((s, idx) => (
              <span key={s.feedType}>
                <strong>{s.feedType}</strong> has only {s.currentStockBags} bags left (~{s.estimatedDaysLeft} days)
                {idx < lowStockAlerts.length - 1 ? ', ' : '. '}
              </span>
            ))}
            Contact your feed mill supplier or integrator to schedule fresh bag delivery.
          </div>
        </div>
      )}

      {/* Stage Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stocks.map((stock) => {
          const isCritical = stock.stockStatus === 'Critical';
          const isLow = stock.stockStatus === 'Low Stock';

          return (
            <div
              key={stock.feedType}
              className={`rounded-xl border p-5 shadow-2xs bg-white transition-all ${
                isCritical
                  ? 'border-rose-300 ring-2 ring-rose-500/10'
                  : isLow
                  ? 'border-amber-300 ring-2 ring-amber-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{stock.feedType} Feed</h3>
                  <span className="text-[11px] font-semibold text-slate-500">{stock.targetFlockAge}</span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                    isCritical
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : isLow
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-farm-50 text-farm-800 border-farm-200'
                  }`}
                >
                  {stock.stockStatus}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-slate-900">{stock.currentStockBags}</span>
                  <span className="text-xs text-slate-500 font-medium ml-1">bags (50kg)</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-700">{stock.currentStockKg.toLocaleString()} kg</span>
                  <div className="text-[11px] text-slate-400">{(stock.currentStockKg / 1000).toFixed(2)} Tonnes</div>
                </div>
              </div>

              <div className="mt-3 bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 flex items-center justify-between">
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Estimated Coverage:
                </span>
                <strong className={isCritical ? 'text-rose-600' : isLow ? 'text-amber-700' : 'text-slate-900'}>
                  ~{stock.estimatedDaysLeft} Days
                </strong>
              </div>

              <p className="mt-3 text-[11px] text-slate-400 truncate">
                {stock.stageDescription}
              </p>
            </div>
          );
        })}
      </div>

      {/* Warehouse Overall Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Warehouse Bags</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalWarehouseBags}</div>
          <span className="text-xs text-slate-500">Total in storage bays</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Biomass Weight</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalWarehouseTonnes.toFixed(2)} T</div>
          <span className="text-xs text-slate-500">Tonnes stored</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Flock Coverage</span>
          <div className="mt-1 text-2xl font-bold text-farm-800">{overallDaysLeft} Days</div>
          <span className="text-xs text-farm-700 font-medium">At current daily intake</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Daily Demand</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{dailyConsumptionBags} bags</div>
          <span className="text-xs text-slate-500">~{Math.round(dailyConsumptionBags * 50)} kg / day</span>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Feed Inventory Transactions Ledger
            </h3>
            <p className="text-xs text-slate-500">Inward mill delivery receipts and shed consumption issues</p>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search mill or invoice..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-farm-600"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              {(['All', 'Inward', 'Consumption'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterType === type
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Type</th>
                <th scope="col" className="px-4 py-3">Feed Stage</th>
                <th scope="col" className="px-4 py-3">Bags</th>
                <th scope="col" className="px-4 py-3">Weight (kg)</th>
                <th scope="col" className="px-4 py-3">Supplier / Mill</th>
                <th scope="col" className="px-4 py-3">Invoice #</th>
                <th scope="col" className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No feed transactions logged yet. Click "+ Log Feed Delivery" to register inward bags.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => {
                  const isInward = tx.transactionType === 'Inward';
                  return (
                    <tr key={tx.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                        {tx.transactionDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            isInward
                              ? 'bg-farm-100 text-farm-900 border border-farm-200'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {isInward ? (
                            <ArrowDownLeft className="w-3 h-3 mr-1 text-farm-700" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 mr-1 text-slate-600" />
                          )}
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                        {tx.feedType}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                        {isInward ? `+${tx.bagsCount}` : `-${tx.bagsCount}`} bags
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {tx.totalWeightKg.toLocaleString()} kg
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {tx.supplierName || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-600">
                        {tx.supplierInvoiceNo || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                        {tx.remarks || 'Standard inward receipt'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inward Modal */}
      <RecordFeedDeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onSave={onAddTransaction}
      />
    </div>
  );
};
