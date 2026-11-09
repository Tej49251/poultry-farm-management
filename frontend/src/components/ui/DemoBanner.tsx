import React from 'react';
import { Sparkles } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center space-x-2 text-amber-900">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-200 text-amber-900 border border-amber-300">
            DEMO MODE
          </span>
          <span className="font-medium">
            Initial UI Demonstration: Displaying simulated broiler flock data. Real farm records will appear once live batches are logged.
          </span>
        </div>
        <div className="hidden md:flex items-center text-amber-800 text-xs font-medium space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Formulas & calculations match verified backend engine</span>
        </div>
      </div>
    </div>
  );
};
