import React from 'react';
import { Menu, Plus, Calendar, Bell, Building } from 'lucide-react';
import { ShedSummary } from '../../types/dashboard';

interface NavbarProps {
  onOpenSidebar: () => void;
  onOpenDailyModal: () => void;
  selectedShedId: number | 'all';
  setSelectedShedId: (id: number | 'all') => void;
  sheds: ShedSummary[];
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  onOpenDailyModal,
  selectedShedId,
  setSelectedShedId,
  sheds,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile trigger & Shed Selector */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Shed Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-farm-50 text-farm-700 hidden sm:flex">
              <Building className="w-4 h-4" />
            </div>
            <select
              value={selectedShedId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedShedId(val === 'all' ? 'all' : Number(val));
              }}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg focus:ring-farm-500 focus:border-farm-500 block px-3 py-1.5 cursor-pointer shadow-2xs hover:bg-slate-100 transition-colors"
            >
              <option value="all">Overview: All Sheds (3)</option>
              {sheds.map((shed) => (
                <option key={shed.id} value={shed.id}>
                  {shed.name} {shed.status === 'Active' ? `(Day ${shed.flockAgeDays || '—'})` : `(${shed.status})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Date, Notifications & Primary Action */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden md:flex items-center text-xs text-slate-500 font-medium space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDate}</span>
          </div>

          <button
            onClick={onOpenDailyModal}
            className="inline-flex items-center space-x-1.5 bg-farm-700 hover:bg-farm-800 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-farm-600 focus:ring-offset-1"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Daily Flock Entry</span>
            <span className="sm:hidden">Log Entry</span>
          </button>

          <button
            aria-label="Notifications"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-farm-600 ring-2 ring-white" />
          </button>

          <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
              TD
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-800">Tejas D.</div>
              <div className="text-[10px] text-slate-500">Farm Owner</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
