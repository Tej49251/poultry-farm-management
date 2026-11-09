import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
} from 'lucide-react';
import { LiftingSlipItem } from '../../types/harvest';
import { ActiveBatchMetrics } from '../../types/dashboard';
import { RecordLiftingModal } from './RecordLiftingModal';

interface LiftingViewProps {
  slips: LiftingSlipItem[];
  activeBatch: ActiveBatchMetrics;
  onAddSlip: (slip: LiftingSlipItem) => void;
}

export const LiftingView: React.FC<LiftingViewProps> = ({
  slips,
  activeBatch,
  onAddSlip,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const totalLiftedBirds = slips.reduce((acc, c) => acc + c.birdsCount, 0);
  const totalNetWeightKg = slips.reduce((acc, c) => acc + c.netWeightKg, 0);
  const totalTonnes = (totalNetWeightKg / 1000).toFixed(2);
  const overallAvgWeight = totalLiftedBirds > 0 ? (totalNetWeightKg / totalLiftedBirds).toFixed(2) : '0.00';

  const liveFlockBeforeHarvest = activeBatch.initialChicks - activeBatch.cumulativeMortality;
  const remainingInShed = Math.max(0, liveFlockBeforeHarvest - totalLiftedBirds);
  const completionRatePct = liveFlockBeforeHarvest > 0
    ? Math.min(100, Math.round((totalLiftedBirds / liveFlockBeforeHarvest) * 100))
    : 0;

  const filteredSlips = slips.filter((s) => {
    if (!searchTerm) return true;
    return (
      s.slipNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-farm-50 text-farm-700">
              <Truck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Bird Lifting Slips & Harvest Register
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Certified weighbridge vehicle slips, net harvest dispatch weight, and live flock balance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-farm-700 hover:bg-farm-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-farm-600 focus:ring-offset-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Lifting Slip</span>
        </button>
      </div>

      {/* Progress & Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Lifted</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalLiftedBirds.toLocaleString()}</div>
          <span className="text-xs text-farm-700 font-medium">{completionRatePct}% harvest completed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Remaining in Shed</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{remainingInShed.toLocaleString()}</div>
          <span className="text-xs text-slate-500">Live birds to harvest</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Net Biomass Lifted</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalTonnes} T</div>
          <span className="text-xs text-slate-500">{totalNetWeightKg.toLocaleString()} kg total</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Average Bird Weight</span>
          <div className="mt-1 text-2xl font-bold text-farm-800">{overallAvgWeight} kg</div>
          <span className="text-xs text-farm-700 font-medium">Across all harvest slips</span>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
          <span className="text-slate-800">Flock Harvest Completion Progress</span>
          <span className="text-farm-800">{completionRatePct}% ({totalLiftedBirds.toLocaleString()} / {liveFlockBeforeHarvest.toLocaleString()} birds)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-farm-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRatePct}%` }}
          />
        </div>
      </div>

      {/* Slips Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Weighbridge Slips Ledger
            </h3>
            <p className="text-xs text-slate-500">Dispatched commercial vehicle weighbridge records</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search slip, buyer, or vehicle..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-farm-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-4 py-3">Slip #</th>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Buyer / Plant</th>
                <th scope="col" className="px-4 py-3">Vehicle #</th>
                <th scope="col" className="px-4 py-3">Cages</th>
                <th scope="col" className="px-4 py-3">Birds Count</th>
                <th scope="col" className="px-4 py-3">Gross Wt (kg)</th>
                <th scope="col" className="px-4 py-3">Tare Wt (kg)</th>
                <th scope="col" className="px-4 py-3">Net Wt (kg)</th>
                <th scope="col" className="px-4 py-3">Avg Wt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSlips.map((slip, idx) => (
                <tr key={slip.slipNo || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-farm-800">
                    {slip.slipNo}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {slip.liftingDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                    {slip.buyerName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-600">
                    {slip.vehicleNo}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {slip.cagesCount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                    {slip.birdsCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {slip.grossWeightKg.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {slip.tareWeightKg.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold text-farm-800">
                    {slip.netWeightKg.toLocaleString()} kg
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                    {slip.avgWeightKg.toFixed(2)} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Modal */}
      <RecordLiftingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddSlip}
        nextSlipIndex={slips.length + 1}
        remainingLiveBirds={remainingInShed}
      />
    </div>
  );
};
