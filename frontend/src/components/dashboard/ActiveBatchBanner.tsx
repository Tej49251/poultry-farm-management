import React from 'react';
import { Calendar, Tag, Clock, MapPin, Feather } from 'lucide-react';
import { ActiveBatchMetrics } from '../../types/dashboard';

interface ActiveBatchBannerProps {
  batch: ActiveBatchMetrics;
}

export const ActiveBatchBanner: React.FC<ActiveBatchBannerProps> = ({ batch }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Flock & Shed details */}
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-farm-100 text-farm-900 border border-farm-200">
              <span className="w-2 h-2 rounded-full bg-farm-600 mr-1.5 animate-pulse" />
              Active Harvesting Flock
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {batch.batchCode}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center text-xs font-medium text-slate-500">
              <Feather className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {batch.breed}
            </span>
          </div>

          <h1 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{batch.shedName}</span>
          </h1>

          <div className="mt-3 flex items-center flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-600 font-medium">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-farm-700" />
              <span>Flock Age: <strong className="text-slate-900">{batch.flockAgeDays} Days</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Placed: <span className="text-slate-700">{batch.placementDate}</span></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Tag className="w-4 h-4 text-slate-400" />
              <span>Placement: <strong className="text-slate-900">{batch.initialChicks.toLocaleString()} Chicks</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Settlement: <strong className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{batch.settlementStatus}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Quick Progress Indicator */}
        <div className="lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 flex flex-row lg:flex-col justify-between items-center lg:items-end">
          <div className="text-xs text-slate-500 font-medium">Lifting Progress</div>
          <div className="text-lg font-bold text-slate-900">
            {batch.totalBirdsLifted.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ {batch.estimatedLiveBirds.toLocaleString()} Birds</span>
          </div>
          <div className="w-32 bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
            <div
              className="bg-farm-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (batch.totalBirdsLifted / (batch.initialChicks - batch.cumulativeMortality)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
