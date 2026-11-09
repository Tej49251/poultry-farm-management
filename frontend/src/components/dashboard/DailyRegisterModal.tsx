import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { DailyLogEntry } from '../../types/dashboard';

interface DailyRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: DailyLogEntry) => void;
  flockAgeDays: number;
  liveBirdsCount: number;
  batchCode: string;
}

export const DailyRegisterModal: React.FC<DailyRegisterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  flockAgeDays,
  liveBirdsCount,
  batchCode,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [logDate, setLogDate] = useState<string>(todayStr);
  const [ageDays, setAgeDays] = useState<number>(flockAgeDays + 1);
  const [mortality, setMortality] = useState<string>('0');
  const [feedBags, setFeedBags] = useState<string>('8.5');
  const [sampleWeightGrams, setSampleWeightGrams] = useState<string>('2020');
  const [waterLitres, setWaterLitres] = useState<string>('1300');
  const [medicines, setMedicines] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  // Auto-calculated fields
  const parsedMortality = Number(mortality) || 0;
  const parsedFeedBags = Number(feedBags) || 0;
  const feedKg = Math.round(parsedFeedBags * 50 * 10) / 10; // 50kg standard bag

  // Automatic calculation of grams per live bird
  const currentLive = Math.max(1, liveBirdsCount - parsedMortality);
  const feedIntakeGramsPerBird = parsedFeedBags > 0
    ? Math.round((feedKg * 1000) / currentLive)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (parsedMortality < 0) {
      newErrors.mortality = 'Mortality cannot be negative';
    }
    if (parsedFeedBags <= 0) {
      newErrors.feedBags = 'Enter feed consumed in bags';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      logDate,
      flockAgeDays: ageDays,
      dailyMortality: parsedMortality,
      dailyFeedBags: parsedFeedBags,
      dailyFeedKg: feedKg,
      avgBodyWeightGrams: sampleWeightGrams ? Number(sampleWeightGrams) : undefined,
      waterConsumptionLitres: waterLitres ? Number(waterLitres) : undefined,
      medicineAdministered: medicines || undefined,
      remarks: remarks || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daily Flock Log Entry
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {batchCode} • Live Flock: {liveBirdsCount.toLocaleString()} birds
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Date and Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Record Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-farm-600 focus:border-farm-600"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Flock Age (Days)
              </label>
              <input
                type="number"
                value={ageDays}
                onChange={(e) => setAgeDays(Number(e.target.value))}
                className="w-full text-xs sm:text-sm bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
          </div>

          {/* Primary Operations: Mortality & Feed Bags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mortality (Birds Died Today)
              </label>
              <input
                type="number"
                min="0"
                value={mortality}
                onChange={(e) => {
                  setMortality(e.target.value);
                  if (errors.mortality) setErrors({});
                }}
                className={`w-full text-xs sm:text-sm bg-white border rounded-lg px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-farm-600 ${
                  errors.mortality ? 'border-rose-500' : 'border-slate-300'
                }`}
                placeholder="0"
                required
              />
              {errors.mortality && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.mortality}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feed Consumed (50kg Bags)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={feedBags}
                  onChange={(e) => {
                    setFeedBags(e.target.value);
                    if (errors.feedBags) setErrors({});
                  }}
                  className={`w-full text-xs sm:text-sm bg-white border rounded-lg px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-farm-600 ${
                    errors.feedBags ? 'border-rose-500' : 'border-slate-300'
                  }`}
                  placeholder="e.g. 8.5"
                  required
                />
              </div>
              {errors.feedBags && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.feedBags}</p>
              )}
            </div>
          </div>

          {/* Automatic Calculation Helper Pill */}
          <div className="bg-farm-50 border border-farm-200/80 rounded-xl p-3 text-xs text-farm-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-farm-700" />
              <span>
                Auto Calculated: <strong>{feedKg} kg feed</strong>
              </span>
            </div>
            <span className="font-semibold bg-farm-200/80 px-2 py-0.5 rounded text-farm-900 text-[11px]">
              ~{feedIntakeGramsPerBird} g/bird
            </span>
          </div>

          {/* Optional Growth & Water fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sample Avg Weight (Grams) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                value={sampleWeightGrams}
                onChange={(e) => setSampleWeightGrams(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-farm-600"
                placeholder="e.g. 1980"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Water Intake (Litres) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                value={waterLitres}
                onChange={(e) => setWaterLitres(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-farm-600"
                placeholder="e.g. 1300"
              />
            </div>
          </div>

          {/* Medicine & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medicines / Vaccines <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={medicines}
                onChange={(e) => setMedicines(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-farm-600"
                placeholder="e.g. Electrolytes, Vitamin C"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Farm Notes / Litter <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-farm-600"
                placeholder="e.g. Litter dry, foggers run 2 hrs"
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
              Save Daily Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
