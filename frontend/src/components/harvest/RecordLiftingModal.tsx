import React, { useState } from 'react';
import { X, Truck, Sparkles } from 'lucide-react';
import { LiftingSlipItem } from '../../types/harvest';

interface RecordLiftingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slip: LiftingSlipItem) => void;
  nextSlipIndex: number;
  remainingLiveBirds: number;
}

const BUYER_OPTIONS = [
  'Venkateshwara Poultry Traders',
  'Suguna Chicken Processing Plant',
  'City Wholesale Poultry Market',
  'Standard Broiler Trader',
];

export const RecordLiftingModal: React.FC<RecordLiftingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nextSlipIndex,
  remainingLiveBirds,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const autoSlipNo = `LIFT-2026-${String(nextSlipIndex).padStart(3, '0')}`;

  const [slipNo, setSlipNo] = useState<string>(autoSlipNo);
  const [date, setDate] = useState<string>(todayStr);
  const [buyerName, setBuyerName] = useState<string>(BUYER_OPTIONS[0]);
  const [vehicleNo, setVehicleNo] = useState<string>('MH-12-BP-4890');
  const [driverName, setDriverName] = useState<string>('');
  const [cagesCount, setCagesCount] = useState<string>('100');
  const [birdsCount, setBirdsCount] = useState<string>(String(Math.min(2000, remainingLiveBirds)));
  const [grossWeight, setGrossWeight] = useState<string>('5000');
  const [tareWeight, setTareWeight] = useState<string>('950');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const parsedBirds = Number(birdsCount) || 0;
  const parsedGross = Number(grossWeight) || 0;
  const parsedTare = Number(tareWeight) || 0;
  const netWeightKg = Math.max(0, parsedGross - parsedTare);
  const avgBirdWeight = parsedBirds > 0 ? (netWeightKg / parsedBirds).toFixed(2) : '0.00';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!slipNo.trim()) {
      newErrors.slipNo = 'Slip number is required';
    }
    if (parsedBirds <= 0) {
      newErrors.birdsCount = 'Enter bird count greater than 0';
    } else if (parsedBirds > remainingLiveBirds) {
      newErrors.birdsCount = `Only ${remainingLiveBirds} birds remain in shed`;
    }
    if (parsedGross <= parsedTare) {
      newErrors.grossWeight = 'Gross weight must be greater than tare weight';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      slipNo: slipNo.trim(),
      liftingDate: date,
      buyerName,
      vehicleNo: vehicleNo.trim(),
      driverName: driverName.trim() || undefined,
      cagesCount: Number(cagesCount) || 100,
      birdsCount: parsedBirds,
      grossWeightKg: parsedGross,
      tareWeightKg: parsedTare,
      netWeightKg,
      avgWeightKg: Number(avgBirdWeight),
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
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Log Bird Lifting Slip
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Weighbridge certified vehicle slip • {remainingLiveBirds.toLocaleString()} birds remain in shed
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
                Slip Number
              </label>
              <input
                type="text"
                value={slipNo}
                onChange={(e) => setSlipNo(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lifting Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Buyer / Trader
              </label>
              <select
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-farm-600"
              >
                {BUYER_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Number
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono uppercase text-slate-900 focus:ring-2 focus:ring-farm-600"
                placeholder="MH-12-BP-4890"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Driver Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-farm-600"
              placeholder="e.g. Ramesh Patil"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cages Count
              </label>
              <input
                type="number"
                min="1"
                value={cagesCount}
                onChange={(e) => setCagesCount(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-farm-600"
                placeholder="100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Birds Lifted Count
              </label>
              <input
                type="number"
                min="1"
                value={birdsCount}
                onChange={(e) => {
                  setBirdsCount(e.target.value);
                  if (errors.birdsCount) setErrors({});
                }}
                className={`w-full text-xs sm:text-sm bg-white border rounded-lg px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-farm-600 ${
                  errors.birdsCount ? 'border-rose-500' : 'border-slate-300'
                }`}
                placeholder="2000"
                required
              />
              {errors.birdsCount && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.birdsCount}</p>
              )}
            </div>
          </div>

          {/* Weighbridge Weights: Gross & Tare */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gross Truck Weight (kg)
              </label>
              <input
                type="number"
                value={grossWeight}
                onChange={(e) => {
                  setGrossWeight(e.target.value);
                  if (errors.grossWeight) setErrors({});
                }}
                className={`w-full text-xs sm:text-sm bg-white border rounded-lg px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-farm-600 ${
                  errors.grossWeight ? 'border-rose-500' : 'border-slate-300'
                }`}
                placeholder="5000"
                required
              />
              {errors.grossWeight && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.grossWeight}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tare (Empty) Weight (kg)
              </label>
              <input
                type="number"
                value={tareWeight}
                onChange={(e) => {
                  setTareWeight(e.target.value);
                  if (errors.grossWeight) setErrors({});
                }}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-farm-600"
                placeholder="950"
                required
              />
            </div>
          </div>

          {/* Auto Calculation Helper */}
          <div className="bg-farm-50 border border-farm-200/80 rounded-xl p-3 text-xs text-farm-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-farm-700" />
              <span>
                Net Dispatched Weight: <strong>{netWeightKg.toLocaleString()} kg</strong>
              </span>
            </div>
            <span className="font-semibold bg-farm-200/80 px-2 py-0.5 rounded text-farm-900 text-[11px]">
              Avg: {avgBirdWeight} kg / bird
            </span>
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
              Confirm Lifting Slip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
