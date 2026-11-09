import React, { useState } from 'react';
import {
  Plus,
  Layers,
  Calendar,
  Feather,
  Building2,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import { BatchItem, CreateBatchInput } from '../../types/batch';
import { ShedSummary } from '../../types/dashboard';
import { CreateBatchModal } from './CreateBatchModal';

interface BatchManagementViewProps {
  batches: BatchItem[];
  sheds: ShedSummary[];
  onCreateBatch: (batch: CreateBatchInput) => void;
  onCloseBatch: (batchId: number) => void;
}

export const BatchManagementView: React.FC<BatchManagementViewProps> = ({
  batches,
  sheds,
  onCreateBatch,
  onCloseBatch,
}) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed' | 'Settled'>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const filteredBatches = batches.filter((b) => {
    if (filterStatus === 'All') return true;
    return b.status === filterStatus;
  });

  const activeCount = batches.filter((b) => b.status === 'Active').length;
  const completedCount = batches.filter((b) => b.status === 'Completed' || b.status === 'Settled').length;
  const totalChicksPlaced = batches.reduce((acc, curr) => acc + curr.initialChicks, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header with Title and Action */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-farm-50 text-farm-700">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Batch Management & Flock Lifecycle
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Track Day-Old-Chicks (DOC) intake, shed capacity allocations, and historical completed batches.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-farm-700 hover:bg-farm-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-farm-600 focus:ring-offset-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Place New Batch</span>
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active Flocks</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</div>
          <span className="text-xs text-farm-700 font-medium">Currently in production</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Placed DOC</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalChicksPlaced.toLocaleString()}</div>
          <span className="text-xs text-slate-500">Across all recorded lots</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Completed Batches</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{completedCount}</div>
          <span className="text-xs text-slate-500">Harvested & archived</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Shed Utilization</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {Math.round((activeCount / Math.max(1, sheds.length)) * 100)}%
          </div>
          <span className="text-xs text-slate-500">{activeCount} of {sheds.length} sheds active</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {(['All', 'Active', 'Completed', 'Settled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === tab
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab === 'All' ? `All Batches (${batches.length})` : tab}
          </button>
        ))}
      </div>

      {/* Batch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBatches.map((batch) => {
          const isActive = batch.status === 'Active';
          return (
            <div
              key={batch.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {/* Card Top: Code and Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-base font-bold text-slate-900">
                        {batch.batchCode}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 font-medium space-x-1 mt-0.5">
                      <Feather className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.breed}</span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-farm-100 text-farm-900 border border-farm-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-farm-600 mr-1.5 animate-pulse" />
                      Active (Day {batch.flockAgeDays})
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {batch.status}
                    </span>
                  )}
                </div>

                {/* Location & Placement */}
                <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1.5 border border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Shed Allocation
                    </span>
                    <span className="font-semibold text-slate-900">{batch.shedName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Placement Date
                    </span>
                    <span className="font-medium text-slate-800">{batch.placementDate}</span>
                  </div>
                  {batch.closedDate && (
                    <div className="flex justify-between text-slate-600">
                      <span>Harvested Date</span>
                      <span className="font-medium text-slate-800">{batch.closedDate}</span>
                    </div>
                  )}
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white border border-slate-100 rounded-lg p-2.5">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Chicks Placed</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {batch.initialChicks.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400">DOC count</span>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-lg p-2.5">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Live / Livability</span>
                    <div className="text-base font-bold text-farm-700 mt-0.5">
                      {(batch.livabilityPercentage ?? 100).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-slate-400">{(batch.estimatedLiveBirds ?? batch.initialChicks).toLocaleString()} live</span>
                  </div>
                </div>

                {/* Benchmark Parameters */}
                <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Target FCR: <strong className="text-slate-800">{(batch.targetFcr ?? 1.60).toFixed(2)}</strong></span>
                  <span>Mortality Cap: <strong className="text-slate-800">{batch.standardMortalityPct}%</strong></span>
                </div>

                {batch.remarks && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-50/50 p-2 rounded">
                    "{batch.remarks}"
                  </p>
                )}
              </div>

              {/* Card Footer: Action */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {batch.chickSupplier || 'Venkateshwara Hatcheries'}
                </span>
                {isActive ? (
                  <button
                    onClick={() => onCloseBatch(batch.id)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Batch</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center">
                    <Archive className="w-3.5 h-3.5 mr-1" />
                    Archived Record
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Place Batch Modal */}
      <CreateBatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={onCreateBatch}
        sheds={sheds}
        nextBatchIndex={batches.length + 1}
      />
    </div>
  );
};
