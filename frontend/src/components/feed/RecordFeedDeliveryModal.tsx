import React, { useState } from 'react';
import { X, Wheat, Sparkles } from 'lucide-react';
import { FeedStage, FeedTransaction } from '../../types/feed';

interface RecordFeedDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<FeedTransaction, 'id'>) => void;
}

const FEED_MILL_OPTIONS = [
  'Godrej Agrovet Feed Mill',
  'Suguna Feeds Integration',
  'Venkateshwara Feeds Ltd',
  'IB Group Feed Plant',
  'Baramati Agro Feeds',
  'Commercial Feed Supplier',
];

export const RecordFeedDeliveryModal: React.FC<RecordFeedDeliveryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [feedType, setFeedType] = useState<FeedStage>('Finisher');
  const [bagsCount, setBagsCount] = useState<string>('80');
  const [bagWeightKg, setBagWeightKg] = useState<string>('50');
  const [supplier, setSupplier] = useState<string>(FEED_MILL_OPTIONS[0]);
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [costPerBag, setCostPerBag] = useState<string>('2150.00');
  const [remarks, setRemarks] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const parsedBags = Number(bagsCount) || 0;
  const parsedWeightPerBag = Number(bagWeightKg) || 50;
  const totalWeightKg = Math.round(parsedBags * parsedWeightPerBag);
  const totalWeightTonnes = (totalWeightKg / 1000).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (parsedBags <= 0) {
      newErrors.bagsCount = 'Enter a valid bag count greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      transactionDate: date,
      feedType,
      transactionType: 'Inward',
      bagsCount: parsedBags,
      weightKgPerBag: parsedWeightPerBag,
      totalWeightKg,
      supplierName: supplier,
      supplierInvoiceNo: invoiceNo.trim() || undefined,
      costPerBag: Number(costPerBag) || 0,
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
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Log Inward Feed Delivery
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Record new feed stock arrival from feed mill or company
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
                Delivery Date
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
                Feed Stage / Type
              </label>
              <select
                value={feedType}
                onChange={(e) => setFeedType(e.target.value as FeedStage)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-farm-600"
              >
                <option value="Pre-Starter">Pre-Starter (Crumbs, Day 1-10)</option>
                <option value="Starter">Starter (Pellets, Day 11-20)</option>
                <option value="Finisher">Finisher (Pellets, Day 21-Harvest)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bags Received
              </label>
              <input
                type="number"
                min="1"
                value={bagsCount}
                onChange={(e) => {
                  setBagsCount(e.target.value);
                  if (errors.bagsCount) setErrors({});
                }}
                className={`w-full text-xs sm:text-sm bg-white border rounded-lg px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-farm-600 ${
                  errors.bagsCount ? 'border-rose-500' : 'border-slate-300'
                }`}
                placeholder="e.g. 100"
                required
              />
              {errors.bagsCount && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.bagsCount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bag Weight (kg)
              </label>
              <input
                type="number"
                value={bagWeightKg}
                onChange={(e) => setBagWeightKg(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
          </div>

          {/* Automatic Calculation Banner */}
          <div className="bg-farm-50 border border-farm-200/80 rounded-xl p-3 text-xs text-farm-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-farm-700" />
              <span>
                Total Inward Weight: <strong>{totalWeightKg.toLocaleString()} kg</strong>
              </span>
            </div>
            <span className="font-semibold bg-farm-200/80 px-2 py-0.5 rounded text-farm-900 text-[11px]">
              {totalWeightTonnes} Tonnes
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feed Mill / Supplier
              </label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-farm-600"
              >
                {FEED_MILL_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice / DC # <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-farm-600"
                placeholder="e.g. INV-9042"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rate per Bag (₹) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={costPerBag}
                onChange={(e) => setCostPerBag(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-farm-600"
                placeholder="2150.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remarks / Lot # <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-farm-600"
                placeholder="e.g. Moisture checked, stored in Bay 2"
              />
            </div>
          </div>

          {/* Modal Actions */}
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
              Confirm Delivery Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
