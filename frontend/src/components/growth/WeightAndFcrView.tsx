import React, { useState } from 'react';
import {
  Scale,
  Plus,
} from 'lucide-react';
import { WeightSampleItem, GrowthCurvePoint } from '../../types/growth';
import { ActiveBatchMetrics } from '../../types/dashboard';
import { RecordWeightSampleModal } from './RecordWeightSampleModal';

interface WeightAndFcrViewProps {
  activeBatch: ActiveBatchMetrics;
  samples: WeightSampleItem[];
  onAddSample: (sample: Omit<WeightSampleItem, 'id'>) => void;
}

const DEFAULT_GROWTH_CURVE: GrowthCurvePoint[] = [
  { ageDays: 0, label: 'Day 0 (DOC)', actualWeightGrams: 42, targetWeightGrams: 42, cumulativeFcr: 0.0, targetFcr: 0.0 },
  { ageDays: 7, label: 'Week 1 (Day 7)', actualWeightGrams: 215, targetWeightGrams: 205, cumulativeFcr: 0.94, targetFcr: 0.95 },
  { ageDays: 14, label: 'Week 2 (Day 14)', actualWeightGrams: 530, targetWeightGrams: 510, cumulativeFcr: 1.16, targetFcr: 1.18 },
  { ageDays: 21, label: 'Week 3 (Day 21)', actualWeightGrams: 1040, targetWeightGrams: 1010, cumulativeFcr: 1.30, targetFcr: 1.32 },
  { ageDays: 28, label: 'Week 4 (Day 28)', actualWeightGrams: 1620, targetWeightGrams: 1590, cumulativeFcr: 1.42, targetFcr: 1.44 },
  { ageDays: 35, label: 'Week 5 (Day 35)', actualWeightGrams: 1980, targetWeightGrams: 2240, cumulativeFcr: 1.56, targetFcr: 1.56 },
  { ageDays: 42, label: 'Week 6 (Day 42)', targetWeightGrams: 2890, targetFcr: 1.68 },
];

export const WeightAndFcrView: React.FC<WeightAndFcrViewProps> = ({
  activeBatch,
  samples,
  onAddSample,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const latestSample = samples.length > 0 ? samples[0] : null;
  const currentWeightGrams = latestSample ? latestSample.avgWeightGrams : activeBatch.avgBodyWeightKg * 1000;
  const currentWeightKg = (currentWeightGrams / 1000).toFixed(2);

  // Average Daily Gain (ADG)
  const adg = '+65.0';
  const uniformity = latestSample ? latestSample.uniformityPct : 86.5;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-farm-50 text-farm-700">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Weight Tracking & FCR Growth Curve
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Compare actual weekly flock weight samples against Cobb 500 standard growth curve and track progressive FCR.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-farm-700 hover:bg-farm-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-farm-600 focus:ring-offset-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record Weigh-in</span>
        </button>
      </div>

      {/* Top Growth Performance KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Current Average Weight</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{currentWeightKg} kg</div>
          <span className="text-xs text-farm-700 font-medium">{currentWeightGrams.toLocaleString()} g / bird</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Average Daily Gain (ADG)</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{adg} g</div>
          <span className="text-xs text-slate-500">Grams gained per day</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cumulative FCR</span>
          <div className="mt-1 text-2xl font-bold text-farm-800">{activeBatch.currentFcr.toFixed(3)}</div>
          <span className="text-xs text-farm-700 font-medium">Favorable vs 1.60 target</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Flock Uniformity</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{uniformity}%</div>
          <span className="text-xs text-slate-500">Within ±10% target band</span>
        </div>
      </div>

      {/* Growth Curve vs Breed Standard Checkpoints */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Weekly Growth Trajectory vs Cobb 500 Breed Standard
            </h3>
            <p className="text-xs text-slate-500">
              Weekly target checkpoints comparing actual sample weights and cumulative FCR efficiency
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-farm-600" />
              <span className="font-semibold text-slate-700">Actual Sample Weight</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="font-semibold text-slate-500">Breed Standard Benchmark</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {DEFAULT_GROWTH_CURVE.map((point) => {
            const hasActual = point.actualWeightGrams !== undefined;
            const variance = hasActual ? point.actualWeightGrams! - point.targetWeightGrams : 0;
            const maxRefWeight = 3000;
            const actualPct = hasActual ? Math.min(100, (point.actualWeightGrams! / maxRefWeight) * 100) : 0;
            const targetPct = Math.min(100, (point.targetWeightGrams / maxRefWeight) * 100);

            return (
              <div key={point.ageDays} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="font-semibold text-slate-900 flex items-center space-x-2">
                    <span>{point.label}</span>
                    {hasActual && (
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          variance >= 0
                            ? 'bg-farm-100 text-farm-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {variance >= 0 ? `+${variance}g ahead` : `${variance}g lag`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-xs">
                    {hasActual ? (
                      <span className="font-bold text-slate-900">
                        {point.actualWeightGrams} g <span className="text-slate-400 font-normal">/ {point.targetWeightGrams} g</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Target: {point.targetWeightGrams} g (Pending)</span>
                    )}
                    <span className="font-semibold text-farm-800 bg-farm-50 px-2 py-0.5 rounded border border-farm-200">
                      FCR: {point.cumulativeFcr ? point.cumulativeFcr.toFixed(2) : `Target ${point.targetFcr}`}
                    </span>
                  </div>
                </div>

                {/* Progress bar visual comparison */}
                <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden">
                  {/* Standard benchmark line/bar */}
                  <div
                    className="absolute top-0 bottom-0 bg-slate-300 rounded-full"
                    style={{ width: `${targetPct}%` }}
                  />
                  {/* Actual sample weight bar */}
                  {hasActual && (
                    <div
                      className="absolute top-0 bottom-0 bg-farm-600 rounded-full transition-all duration-500 opacity-90"
                      style={{ width: `${actualPct}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weigh-in History Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Flock Weigh-in Sampling Ledger
            </h3>
            <p className="text-xs text-slate-500">Historical sampling weights, sample size and uniformity records</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {samples.length} weigh-in records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Flock Age</th>
                <th scope="col" className="px-4 py-3">Birds Sampled</th>
                <th scope="col" className="px-4 py-3">Average Weight</th>
                <th scope="col" className="px-4 py-3">Standard Target</th>
                <th scope="col" className="px-4 py-3">Variance</th>
                <th scope="col" className="px-4 py-3">Uniformity (%)</th>
                <th scope="col" className="px-4 py-3">FCR at Sample</th>
                <th scope="col" className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {samples.map((sample, idx) => (
                <tr key={sample.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                    {sample.sampleDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                      Day {sample.flockAgeDays}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {sample.sampleBirdsCount} birds
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                    {sample.avgWeightGrams} g <span className="text-xs text-slate-400 font-normal">({(sample.avgWeightGrams / 1000).toFixed(2)} kg)</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {sample.breedStandardTargetGrams} g
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold">
                    <span className={sample.varianceGrams >= 0 ? 'text-farm-700' : 'text-amber-700'}>
                      {sample.varianceGrams >= 0 ? `+${sample.varianceGrams} g` : `${sample.varianceGrams} g`}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                    {sample.uniformityPct}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-farm-800">
                    {sample.computedCumulativeFcr.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                    {sample.remarks || 'Standard sample weigh-in'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Modal */}
      <RecordWeightSampleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddSample}
        currentFlockAge={activeBatch.flockAgeDays}
      />
    </div>
  );
};
