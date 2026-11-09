import React from 'react';
import { BirdLiftingEntry } from '../../types/dashboard';
import { Truck } from 'lucide-react';

interface LiftingRegisterTableProps {
  records: BirdLiftingEntry[];
  totalLiveBeforeLifting?: number;
}

export const LiftingRegisterTable: React.FC<LiftingRegisterTableProps> = ({
  records,
}) => {
  const totalLiftedCount = records.reduce((acc, curr) => acc + curr.birdsCount, 0);
  const totalWeightKg = records.reduce((acc, curr) => acc + curr.netWeightKg, 0);
  const avgFlockWeight = totalLiftedCount > 0 ? (totalWeightKg / totalLiftedCount).toFixed(2) : '0.00';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-farm-50 text-farm-700">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Bird Lifting Slips & Harvest Records
            </h3>
            <p className="text-xs text-slate-500">
              Commercial vehicle weighing slips, crate counts and net weight dispatched
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-xs font-semibold">
          <span className="text-slate-500">Avg Weight: <strong className="text-slate-900">{avgFlockWeight} kg</strong></span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Total Lifted: <strong className="text-farm-700">{totalLiftedCount.toLocaleString()} birds</strong></span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th scope="col" className="px-4 py-3">Slip #</th>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Buyer / Trader</th>
              <th scope="col" className="px-4 py-3">Vehicle #</th>
              <th scope="col" className="px-4 py-3">Cages</th>
              <th scope="col" className="px-4 py-3">Birds Count</th>
              <th scope="col" className="px-4 py-3">Gross Wt (kg)</th>
              <th scope="col" className="px-4 py-3">Tare Wt (kg)</th>
              <th scope="col" className="px-4 py-3">Net Wt (kg)</th>
              <th scope="col" className="px-4 py-3">Avg (kg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {records.map((slip) => (
              <tr key={slip.slipNo} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-farm-800">
                  {slip.slipNo}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{slip.liftingDate}</td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">{slip.buyerName}</td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-600">{slip.vehicleNo}</td>
                <td className="px-4 py-3 whitespace-nowrap">{slip.cagesCount}</td>
                <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">{slip.birdsCount.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{slip.grossWeightKg.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{slip.tareWeightKg.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap font-bold text-farm-800">{slip.netWeightKg.toLocaleString()} kg</td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">{slip.avgWeightKg.toFixed(2)} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
