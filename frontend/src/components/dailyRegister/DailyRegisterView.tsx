import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Wheat,
  Scale,
  AlertTriangle,
  Trash2,
  Sparkles,
  Search,
} from 'lucide-react';
import { DailyLogEntry, ActiveBatchMetrics } from '../../types/dashboard';

interface DailyRegisterViewProps {
  logs: DailyLogEntry[];
  activeBatch: ActiveBatchMetrics;
  onOpenModal: () => void;
  onDeleteLog: (logIndex: number) => void;
}

export const DailyRegisterView: React.FC<DailyRegisterViewProps> = ({
  logs,
  activeBatch,
  onOpenModal,
  onDeleteLog,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    return (
      log.logDate.includes(searchTerm) ||
      (log.remarks && log.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.medicineAdministered && log.medicineAdministered.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const totalPeriodMortality = logs.reduce((acc, curr) => acc + curr.dailyMortality, 0);
  const totalPeriodFeedBags = logs.reduce((acc, curr) => acc + curr.dailyFeedBags, 0);
  const totalPeriodFeedKg = Math.round(totalPeriodFeedBags * 50);
  const latestWeight = logs.find((l) => l.avgBodyWeightGrams)?.avgBodyWeightGrams || (activeBatch.avgBodyWeightKg * 1000);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-farm-50 text-farm-700">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Daily Flock Register
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Daily logs of mortality, feed intake, sample weights, water consumption, and flock observations.
          </p>
        </div>

        <button
          onClick={onOpenModal}
          className="inline-flex items-center justify-center space-x-2 bg-farm-700 hover:bg-farm-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-farm-600 focus:ring-offset-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Entry</span>
        </button>
      </div>

      {/* Flock Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Period Mortality</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalPeriodMortality} birds</div>
          <span className="text-xs text-rose-600 font-medium">Logged in register</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Period Feed</span>
            <Wheat className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalPeriodFeedBags.toFixed(1)} bags</div>
          <span className="text-xs text-slate-500">{totalPeriodFeedKg.toLocaleString()} kg total</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Average Daily Intake</span>
            <Sparkles className="w-4 h-4 text-farm-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            ~{activeBatch.feedIntakePerBirdGrams} g
          </div>
          <span className="text-xs text-farm-700 font-medium">per bird / day</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Latest Weight Sample</span>
            <Scale className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {latestWeight.toFixed(0)} g
          </div>
          <span className="text-xs text-slate-500">Day {activeBatch.flockAgeDays} sample</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by date, remarks, or medicines..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-farm-600"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{filteredLogs.length}</span> records logged
        </div>
      </div>

      {/* Register Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Flock Age</th>
                <th scope="col" className="px-4 py-3">Mortality</th>
                <th scope="col" className="px-4 py-3">Feed Bags</th>
                <th scope="col" className="px-4 py-3">Feed (kg)</th>
                <th scope="col" className="px-4 py-3">Sample Wt (g)</th>
                <th scope="col" className="px-4 py-3">Water (L)</th>
                <th scope="col" className="px-4 py-3">Medicines & Observations</th>
                <th scope="col" className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400 text-sm">
                    No daily logs found matching your criteria. Click "+ New Daily Entry" to add one.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                      {log.logDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                        Day {log.flockAgeDays}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-semibold ${log.dailyMortality > 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {log.dailyMortality} birds
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                      {log.dailyFeedBags} bags
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {log.dailyFeedKg} kg
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                      {log.avgBodyWeightGrams ? `${log.avgBodyWeightGrams} g` : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {log.waterConsumptionLitres ? `${log.waterConsumptionLitres.toLocaleString()} L` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-sm">
                      {log.medicineAdministered && (
                        <div className="font-semibold text-amber-800 mb-0.5">
                          Med: {log.medicineAdministered}
                        </div>
                      )}
                      <div className="text-slate-500 truncate">{log.remarks || 'Normal flock condition'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => onDeleteLog(index)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
