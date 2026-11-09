import React, { useState } from 'react';
import { X, Receipt } from 'lucide-react';
import { SettlementVoucherItem } from '../../types/harvest';

interface GenerateSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (voucher: SettlementVoucherItem) => void;
  batchId: number;
  batchCode: string;
  totalNetWeightKg: number;
  totalBirdsLifted: number;
  actualFcr: number;
  mortalityPct: number;
}

export const GenerateSettlementModal: React.FC<GenerateSettlementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  batchId,
  batchCode,
  totalNetWeightKg,
  totalBirdsLifted,
  actualFcr,
  mortalityPct,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [baseGcRate, setBaseGcRate] = useState<string>('12.50');
  const [benchmarkFcr, setBenchmarkFcr] = useState<string>('1.60');
  const [fcrIncentiveRate, setFcrIncentiveRate] = useState<string>('0.50');
  const [otherIncentives, setOtherIncentives] = useState<string>('1200.00');
  const [medicineDeductions, setMedicineDeductions] = useState<string>('350.00');
  const [remarks, setRemarks] = useState<string>('Full batch harvesting completed successfully');

  if (!isOpen) return null;

  const parsedBaseRate = Number(baseGcRate) || 12.50;
  const parsedBenchmarkFcr = Number(benchmarkFcr) || 1.60;
  const parsedIncentiveRate = Number(fcrIncentiveRate) || 0.50;
  const parsedOtherIncentives = Number(otherIncentives) || 0;
  const parsedMedicineDeductions = Number(medicineDeductions) || 0;

  // Real-time calculations
  const baseGc = Math.round(totalNetWeightKg * parsedBaseRate * 100) / 100;
  const fcrDiff = Math.max(0, parsedBenchmarkFcr - actualFcr);
  const fcrIncentive = Math.round(fcrDiff * parsedIncentiveRate * totalNetWeightKg * 100) / 100;
  const grossEarnings = Math.round((baseGc + fcrIncentive + parsedOtherIncentives) * 100) / 100;
  const netPayable = Math.round((grossEarnings - parsedMedicineDeductions) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      batchId,
      voucherNo: `GC-${batchCode}-${new Date().getFullYear()}`,
      settlementDate: date,
      totalBirdsLifted,
      totalNetWeightKg,
      actualFcr,
      benchmarkFcr: parsedBenchmarkFcr,
      actualMortalityPct: mortalityPct,
      standardMortalityPct: 5.0,
      baseGcRatePerKg: parsedBaseRate,
      baseGrowingCharges: baseGc,
      fcrIncentive,
      otherIncentives: parsedOtherIncentives,
      mortalityDeduction: 0.0,
      medicineDeduction: parsedMedicineDeductions,
      totalDeductions: parsedMedicineDeductions,
      netPayableAmount: netPayable,
      status: 'Approved',
      remarks: remarks.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-farm-100 text-farm-800">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Generate Final Grower Settlement
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {batchCode} • {totalNetWeightKg.toLocaleString()} kg total lifted
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Settlement Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Base GC Rate (₹ / kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={baseGcRate}
                onChange={(e) => setBaseGcRate(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Benchmark Standard FCR
              </label>
              <input
                type="number"
                step="0.01"
                value={benchmarkFcr}
                onChange={(e) => setBenchmarkFcr(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                FCR Bonus Rate (₹ / pt / kg)
              </label>
              <input
                type="number"
                step="0.05"
                value={fcrIncentiveRate}
                onChange={(e) => setFcrIncentiveRate(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Livability & Management Bonus (₹)
              </label>
              <input
                type="number"
                value={otherIncentives}
                onChange={(e) => setOtherIncentives(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-farm-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medicines Deductions (₹)
              </label>
              <input
                type="number"
                value={medicineDeductions}
                onChange={(e) => setMedicineDeductions(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-farm-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Settlement Notes / Remarks <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-farm-600"
              placeholder="e.g. Final flock settlement voucher"
            />
          </div>

          {/* Live Voucher Calculation Summary Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Base GC ({totalNetWeightKg.toLocaleString()} kg @ ₹{parsedBaseRate.toFixed(2)}/kg)</span>
              <span className="font-semibold text-slate-900">₹{baseGc.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="text-farm-700 font-medium">FCR Incentive (Actual {actualFcr.toFixed(2)} vs {parsedBenchmarkFcr.toFixed(2)})</span>
              <span className="font-semibold text-farm-700">+₹{fcrIncentive.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Management & Livability Bonus</span>
              <span className="font-semibold text-farm-700">+₹{parsedOtherIncentives.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-200">
              <span>Vaccines & Medicines Deductions</span>
              <span className="font-semibold text-rose-600">-₹{parsedMedicineDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-slate-900 text-sm">Net Payable to Farmer</span>
              <span className="font-bold text-farm-800 text-lg">₹{netPayable.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-farm-700 hover:bg-farm-800 shadow-sm transition-all focus:ring-2 focus:ring-farm-600"
            >
              Issue Settlement Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
