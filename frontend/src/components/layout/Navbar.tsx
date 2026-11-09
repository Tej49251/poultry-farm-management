import React, { useState } from 'react';
import { Menu, Plus, Calendar, Building, Radio, LogIn, LogOut, Shield } from 'lucide-react';
import { ShedSummary } from '../../types/dashboard';
import { UserProfile } from '../../services/api';

interface NavbarProps {
  onOpenSidebar: () => void;
  onOpenDailyModal: () => void;
  selectedShedId: number | 'all';
  setSelectedShedId: (id: number | 'all') => void;
  sheds: ShedSummary[];
  backendOnline: boolean;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  onOpenDailyModal,
  selectedShedId,
  setSelectedShedId,
  sheds,
  backendOnline,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const initials = currentUser?.full_name
    ? currentUser.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'TD';

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
              <option value="all">Overview: All Sheds ({sheds.length})</option>
              {sheds.map((shed) => (
                <option key={shed.id} value={shed.id}>
                  {shed.name} {shed.status === 'Active' ? `(Day ${shed.flockAgeDays || '—'})` : `(${shed.status})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Backend indicator, Date, Daily Action & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Backend Connectivity Status Badge */}
          <div
            className={`hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              backendOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title={backendOnline ? 'Connected to REST API & Database' : 'Offline Mode (Local demo fallback active)'}
          >
            <Radio className={`w-3 h-3 ${backendOnline ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
            <span>{backendOnline ? 'API Connected' : 'Offline Demo'}</span>
          </div>

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

          {/* User Profile / Auth Button */}
          <div className="relative pl-1 border-l border-slate-200">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-farm-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {initials}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-semibold text-slate-800">{currentUser.full_name || currentUser.username}</div>
                    <div className="text-[10px] text-farm-700 font-medium">{currentUser.role}</div>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-800">{currentUser.full_name || currentUser.username}</div>
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Shield className="w-3 h-3 text-farm-600" />
                        <span>Role: {currentUser.role}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-farm-700 hover:text-farm-800 bg-farm-50 hover:bg-farm-100 border border-farm-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
