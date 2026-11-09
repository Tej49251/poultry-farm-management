import React from 'react';
import { ShedSummary } from '../../types/dashboard';
import { Sparkles } from 'lucide-react';

interface ShedCardProps {
  shed: ShedSummary;
  isSelected: boolean;
  onSelect: () => void;
}

export const ShedCard: React.FC<ShedCardProps> = ({ shed, isSelected, onSelect }) => {
  const getStatusBadge = () => {
    switch (shed.status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-farm-100 text-farm-900 border border-farm-200">
            <span className="w-1.5 h-1.5 rounded-full bg-farm-600 mr-1 animate-pulse" />
            Active Flock
          </span>
        );
      case 'Sanitizing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Sanitizing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Empty
          </span>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border p-4 transition-all cursor-pointer ${
        isSelected
          ? 'bg-white border-farm-600 shadow-sm ring-2 ring-farm-600/20'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
            {shed.id}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{shed.name}</h3>
            <p className="text-[11px] text-slate-500">Cap: {shed.capacity.toLocaleString()} birds</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {shed.status === 'Active' ? (
        <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Age</span>
            <div className="text-sm font-bold text-slate-900">{shed.flockAgeDays}d</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Live Birds</span>
            <div className="text-sm font-bold text-slate-900">{shed.liveBirds?.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">FCR</span>
            <div className="text-sm font-bold text-farm-700">{shed.fcr?.toFixed(2)}</div>
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-500">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Cleaning & disinfection in progress. Ready for next chick placement in 5 days.</span>
        </div>
      )}
    </div>
  );
};
