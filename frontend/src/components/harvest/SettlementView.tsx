import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { SettlementVoucherItem } from '../../types/harvest';
import { ActiveBatchMetrics } from '../../types/dashboard';
import { GenerateSettlementModal } from './GenerateSettlementModal';

interface SettlementViewProps {
  voucher: SettlementVoucherItem | null;
  activeBatch: ActiveBatchMetrics;
  totalLiftedWeightKg: number;
  totalBirdsLifted: number;
  onSaveVoucher: (v: SettlementVoucherItem) => void;
  onMarkPaid: () => void;
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  voucher,
  activeBatch,
  totalLiftedWeightKg,
  totalBirdsLifted,
  onSaveVoucher,
  onMarkPaid,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fallback defaults if no voucher yet generated
  const baseRate = voucher ? voucher.baseGcRatePerKg : 12.50;
  const baseGc = voucher ? voucher.baseGrowingCharges : Math.round(totalLiftedWeightKg * baseRate);
  const fcrIncentive = voucher ? voucher.fcrIncentive : Math.round(Math.max(0, 1.60 - activeBatch.currentFcr) * 0.50 * totalLiftedWeightKg);
  const otherIncentives = voucher ? voucher.otherIncentives : 1200.0;
  const deductions = voucher ? voucher.totalDeductions : 350.0;
  const netPayable = voucher ? voucher.netPayableAmount : (baseGc + fcrIncentive + otherIncentives - deductions);
  const status = voucher ? voucher.status : 'Approved';

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-farm-50 text-farm-700">
              <Receipt className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Grower Settlement & Final Payout
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Contract farming growing charges (GC), FCR performance incentives, and net farmer payout voucher.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Voucher</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-farm-700 hover:bg-farm-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-farm-600 focus:ring-offset-1 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Settlement</span>
          </button>
        </div>
      </div>

      {/* Top Financial Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Net Biomass Lifted</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{(totalLiftedWeightKg / 1000).toFixed(2)} T</div>
          <span className="text-xs text-slate-500">{totalLiftedWeightKg.toLocaleString()} kg net</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Base Growing Charges</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">₹{baseGc.toLocaleString()}</div>
          <span className="text-xs text-slate-500">@ ₹{baseRate.toFixed(2)} / kg</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">FCR Bonus Earned</span>
          <div className="mt-1 text-2xl font-bold text-farm-700">+₹{fcrIncentive.toLocaleString()}</div>
          <span className="text-xs text-farm-700 font-medium">FCR {activeBatch.currentFcr.toFixed(2)} vs 1.60</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Net Grower Payout</span>
          <div className="mt-1 text-2xl font-bold text-farm-800">₹{netPayable.toLocaleString()}</div>
          <span className="text-xs text-farm-700 font-medium">{status} status</span>
        </div>
      </div>

      {/* Itemized Voucher Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Voucher Header Banner */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-slate-900">
                {voucher?.voucherNo || `GC-${activeBatch.batchCode}-2026`}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">
                Batch: {activeBatch.batchCode} ({activeBatch.breed})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Green Valley Broiler Farm • {activeBatch.shedName}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                status === 'Paid'
                  ? 'bg-farm-100 text-farm-800 border-farm-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {status}
            </span>

            {status !== 'Paid' && (
              <button
                onClick={onMarkPaid}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-farm-700 hover:bg-farm-800 text-white transition-colors"
              >
                Mark as Paid
              </button>
            )}
          </div>
        </div>

        {/* Itemized Table Statement */}
        <div className="p-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="pb-3 text-left">Description / Contract Line Item</th>
                  <th className="pb-3 text-center">Reference Units</th>
                  <th className="pb-3 text-center">Rate / Multiplier</th>
                  <th className="pb-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {/* Base GC */}
                <tr>
                  <td className="py-3 text-slate-900 font-semibold">
                    Base Growing Charges (GC)
                    <div className="text-[11px] text-slate-400 font-normal">Agreed contract rate per kg of live weight delivered</div>
                  </td>
                  <td className="py-3 text-center">{totalLiftedWeightKg.toLocaleString()} kg</td>
                  <td className="py-3 text-center">₹{baseRate.toFixed(2)} / kg</td>
                  <td className="py-3 text-right font-bold text-slate-900">₹{baseGc.toLocaleString()}</td>
                </tr>

                {/* FCR Incentive */}
                <tr>
                  <td className="py-3 text-slate-900 font-semibold">
                    FCR Efficiency Bonus
                    <div className="text-[11px] text-slate-400 font-normal">Awarded for achieving 1.562 FCR vs 1.60 contract benchmark (+0.038 points)</div>
                  </td>
                  <td className="py-3 text-center">{totalLiftedWeightKg.toLocaleString()} kg</td>
                  <td className="py-3 text-center font-mono">₹0.50 / pt</td>
                  <td className="py-3 text-right font-bold text-farm-700">+₹{fcrIncentive.toLocaleString()}</td>
                </tr>

                {/* Livability / Management Incentive */}
                <tr>
                  <td className="py-3 text-slate-900 font-semibold">
                    Flock Livability & Management Incentive
                    <div className="text-[11px] text-slate-400 font-normal">Bonus for low flock mortality (2.84% vs 5.0% contract threshold)</div>
                  </td>
                  <td className="py-3 text-center">97.16% Livability</td>
                  <td className="py-3 text-center">Flat Bonus</td>
                  <td className="py-3 text-right font-bold text-farm-700">+₹{otherIncentives.toLocaleString()}</td>
                </tr>

                {/* Deductions */}
                <tr>
                  <td className="py-3 text-slate-900 font-semibold">
                    Vaccines, Electrolytes & Disinfection Deductions
                    <div className="text-[11px] text-slate-400 font-normal">Medicines and farm biosecurity supplies supplied by company</div>
                  </td>
                  <td className="py-3 text-center">Batch Lot Supplies</td>
                  <td className="py-3 text-center">Company Debit</td>
                  <td className="py-3 text-right font-bold text-rose-600">-₹{deductions.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statement Total Strip */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Net Payout to Poultry Grower
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Full and final contract settlement for Batch {activeBatch.batchCode}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-farm-800">
                ₹{netPayable.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Direct Bank Transfer / NEFT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      <GenerateSettlementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveVoucher}
        batchId={activeBatch.batchId}
        batchCode={activeBatch.batchCode}
        totalNetWeightKg={totalLiftedWeightKg}
        totalBirdsLifted={totalBirdsLifted}
        actualFcr={activeBatch.currentFcr}
        mortalityPct={activeBatch.mortalityPercentage}
      />
    </div>
  );
};
