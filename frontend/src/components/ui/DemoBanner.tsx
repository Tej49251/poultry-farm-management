import React from 'react';
import { Database, Sparkles, CheckCircle2 } from 'lucide-react';

interface DemoBannerProps {
  backendOnline?: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ backendOnline = false }) => {
  if (backendOnline) {
    return (
      <div className="bg-emerald-50 border-b border-emerald-200/80 px-4 py-2 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-900">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>LIVE API READY</span>
            </span>
            <span className="font-medium hidden sm:inline">
              Synchronized with FastAPI backend and PostgreSQL / SQLite engine. Real batch operations persist directly to database.
            </span>
            <span className="font-medium sm:hidden">
              Connected to live backend database.
            </span>
          </div>
          <div className="hidden md:flex items-center text-emerald-800 text-xs font-medium space-x-1">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Automated calculation & validation active</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-amber-900">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-200 text-amber-900 border border-amber-300">
            OFFLINE / DEMO MODE
          </span>
          <span className="font-medium hidden sm:inline">
            FastAPI backend is offline or unreachable. Displaying demo broiler flock data with client-side mathematical calculations.
          </span>
          <span className="font-medium sm:hidden">
            Displaying simulated demo flock data.
          </span>
        </div>
        <div className="hidden md:flex items-center text-amber-800 text-xs font-medium space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Formulas verified against Cobb 500 standards</span>
        </div>
      </div>
    </div>
  );
};
