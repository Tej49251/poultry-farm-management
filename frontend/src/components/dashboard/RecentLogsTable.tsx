import React from 'react';
import { DailyLogEntry } from '../../types/dashboard';
import { ClipboardList, Plus } from 'lucide-react';

interface RecentLogsTableProps {
  logs: DailyLogEntry[];
  onOpenModal: () => void;
}

export const RecentLogsTable: React.FC<RecentLogsTableProps> = ({ logs, onOpenModal }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-farm-50 text-farm-700">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Daily Flock Register
            </h3>
            <p className="text-xs text-slate-500">
              Last 5 days of daily mortality, feed intake and flock growth observations
            </p>
          </div>
        </div>
        <button
          onClick={onOpenModal}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-farm-700 hover:text-farm-800 bg-farm-50 hover:bg-farm-100 px-3 py-1.5 rounded-lg border border-farm-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Age (Days)</th>
              <th scope="col" className="px-4 py-3">Mortality</th>
              <th scope="col" className="px-4 py-3">Feed (Bags / kg)</th>
              <th scope="col" className="px-4 py-3">Sample Wt (g)</th>
              <th scope="col" className="px-4 py-3">Water (L)</th>
              <th scope="col" className="px-4 py-3">Medicines & Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {logs.map((log, index) => (
              <tr
                key={log.id || index}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                  {log.logDate}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                    Day {log.flockAgeDays}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-rose-600 font-semibold">
                  {log.dailyMortality} birds
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {log.dailyFeedBags} bags <span className="text-slate-400 font-normal">({log.dailyFeedKg} kg)</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                  {log.avgBodyWeightGrams ? `${log.avgBodyWeightGrams} g` : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {log.waterConsumptionLitres ? `${log.waterConsumptionLitres.toLocaleString()} L` : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                  {log.remarks || log.medicineAdministered || 'Normal flock condition'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
