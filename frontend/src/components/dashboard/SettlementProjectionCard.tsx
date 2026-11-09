import React from 'react';
import { Receipt, TrendingUp } from 'lucide-react';

interface SettlementProjectionCardProps {
  netWeightKg: number;
  baseRatePerKg: number;
  actualFcr: number;
  benchmarkFcr: number;
  status: 'Pending' | 'In Progress' | 'Settled';
}

export const SettlementProjectionCard: React.FC<SettlementProjectionCardProps> = ({
  netWeightKg,
  baseRatePerKg = 12.50,
  actualFcr,
  benchmarkFcr = 1.60,
  status,
}) => {
  const baseEarnings = netWeightKg * baseRatePerKg;
  const fcrDiff = Math.max(0, benchmarkFcr - actualFcr);
  // ₹0.50 bonus per point below 1.60 per kg
  const fcrIncentive = Math.round(fcrDiff * 0.50 * netWeightKg);
  const totalIncentives = fcrIncentive + 1200; // e.g. early lifting & livability bonus
  const medicineDeduction = 350;
  const netPayable = baseEarnings + totalIncentives - medicineDeduction;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-farm-50 text-farm-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Grower Settlement Estimate
              </h3>
              <p className="text-xs text-slate-500">Contract Farming Growing Charges (GC)</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
            {status}
          </span>
        </div>

        {/* Calculation Line Items */}
        <div className="mt-4 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between items-center text-slate-600">
            <span>Base Growing Charges ({netWeightKg.toLocaleString()} kg @ ₹{baseRatePerKg.toFixed(2)}/kg)</span>
            <span className="font-semibold text-slate-900">₹{baseEarnings.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center">
              <TrendingUp className="w-3.5 h-3.5 text-farm-600 mr-1.5" />
              FCR Performance Incentive (FCR {actualFcr.toFixed(2)} vs {benchmarkFcr.toFixed(2)})
            </span>
            <span className="font-semibold text-farm-700">+₹{fcrIncentive.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Livability & Management Bonus</span>
            <span className="font-semibold text-farm-700">+₹1,200</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Vaccines & Disinfection Deductions</span>
            <span className="font-semibold text-rose-600">-₹{medicineDeduction.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-xl">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Estimated Net Payout
            </span>
            <p className="text-[11px] text-slate-400">Final voucher issued upon full batch lifting</p>
          </div>
          <div className="text-2xl font-bold text-farm-800">
            ₹{netPayable.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
