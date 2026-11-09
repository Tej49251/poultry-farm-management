import React from 'react';
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  Wheat,
  Scale,
  Truck,
  Receipt,
  Building2,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  phase?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { id: 'batches', label: 'Batch Management', icon: Layers },
  { id: 'daily-register', label: 'Daily Flock Register', icon: ClipboardList },
  { id: 'feed', label: 'Feed & Nutrition', icon: Wheat },
  { id: 'weight', label: 'Weight & FCR Growth', icon: Scale },
  { id: 'lifting', label: 'Bird Lifting Records', icon: Truck },
  { id: 'settlement', label: 'Settlement & Payout', icon: Receipt },
  { id: 'sheds', label: 'Shed Configuration', icon: Building2 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-farm-600 flex items-center justify-center text-white shadow-sm shadow-farm-600/30">
              <span className="text-xl font-bold tracking-tighter">PF</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                PoultryMaster
              </div>
              <div className="text-xs text-slate-500 font-medium">Farm Operations OS</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 lg:hidden text-slate-500 hover:text-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Farm Context Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Unit
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-farm-100 text-farm-800 border border-farm-200">
              Live 3 Sheds
            </span>
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-800 truncate">
            Green Valley Broiler Farm
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Shed 1 • Cobb 500 (Day 36)</div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  onClose();
                }}
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-farm-50 text-farm-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-farm-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-farm-600" />}
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-200 text-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Health / Footer */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-farm-600" />
            <span className="font-medium text-slate-700">Phase 1 Web Dashboard</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Build v0.1.0-alpha • Release v1.0.0 Ready
          </div>
        </div>
      </aside>
    </>
  );
};
