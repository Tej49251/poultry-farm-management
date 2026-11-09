import React, { useState } from 'react';
import { X, Scale, Sparkles } from 'lucide-react';
import { WeightSampleItem } from '../../types/growth';

interface RecordWeightSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sample: Omit<WeightSampleItem, 'id'>) => void;
  currentFlockAge: number;
}

const BREED_STANDARDS: { [day: number]: number } = {
  0: 42,
  7: 205,
  14: 510,
  21: 1010,
  28: 1590,
  35: 2240,
  42: 2890,
};

function getStandardForDay(day: number): number {
  if (day <= 0) return 42;
  if (day >= 42) return 2890;
  const days = [0, 7, 14, 21, 28, 35, 42];
  for (let i = 0; i < days.length - 1; i++) {
    const d1 = days[i];
    const d2 = days[i + 1];
    if (d1 <= day && day <= d2) {
      const ratio = (day - d1) / (d2 - d1);
      return Math.round(BREED_STANDARDS[d1] + ratio * (BREED_STANDARDS[d2] - BREED_STANDARDS[d1]));
    }
  }
  return 2240;
}

export const RecordWeightSampleModal: React.FC<RecordWeightSampleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentFlockAge,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [ageDays, setAgeDays] = useState<number>(currentFlockAge);
  const [birdsCount, setBirdsCount] = useState<string>('100');
  const [weightGrams, setWeightGrams] = useState<string>('1980');
  const [uniformity, setUniformity] = useState<string>('86.5');
  const [remarks, setRemarks] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const parsedGrams = Number(weightGrams) || 0;
  const targetStandard = getStandardForDay(ageDays);
  const variance = Math.round((parsedGrams - targetStandard) * 10) / 10;
  const weightKg = (parsedGrams / 1000).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (parsedGrams <= 0) {
      newErrors.weightGrams = 'Enter average sample weight in grams';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      sampleDate: date,
      flockAgeDays: ageDays,
      sampleBirdsCount: Number(birdsCount) || 100,
      avgWeightGrams: parsedGrams,
      uniformityPct: Number(uniformity) || 85.0,
      breedStandardTargetGrams: targetStandard,
      varianceGrams: variance,
      computedCumulativeFcr: 1.562,
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
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Log Flock Weigh-in Sample
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Record weekly flock weight sample to benchmark against Cobb 500 standard
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
                Weigh-in Date
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Average Weight (Grams)
              </label>
              <input
                type="number"
                min="10"
                value={weightGrams}
                onChange={(e) => {
                  setWeightGrams(e.target.value);
                  if (errors.weightGrams) setErrors({});
                }}
                className={`w-full text-xs sm:text-sm bg-white border rounded-lg px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-farm-600 ${
                  errors.weightGrams ? 'border-rose-500' : 'border-slate-300'
                }`}
                placeholder="e.g. 1980"
                required
              />
              {errors.weightGrams && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.weightGrams}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Birds Sampled Count
              </label>
              <input
                type="number"
                value={birdsCount}
                onChange={(e) => setBirdsCount(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-farm-600"
                placeholder="100"
                required
              />
            </div>
          </div>

          {/* Automatic Calculation Banner */}
          <div className="bg-farm-50 border border-farm-200/80 rounded-xl p-3 text-xs text-farm-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-farm-700" />
              <span>
                Standard Target: <strong>{targetStandard} g</strong> ({weightKg} kg body weight)
              </span>
            </div>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                variance >= 0 ? 'bg-farm-200/80 text-farm-900' : 'bg-amber-200 text-amber-900'
              }`}
            >
              {variance >= 0 ? `+${variance}g ahead` : `${variance}g lag`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Flock Uniformity (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={uniformity}
                  onChange={(e) => setUniformity(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-farm-600"
                  placeholder="85.0"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sampling Location / Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-farm-600"
                placeholder="e.g. Weighing from 3 random catch frames"
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
              Save Weigh-in Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

