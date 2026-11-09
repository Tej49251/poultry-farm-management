import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  highlight?: 'default' | 'success' | 'warning' | 'alert';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  highlight = 'default',
}) => {
  const getBadgeStyle = () => {
    switch (highlight) {
      case 'success':
        return 'text-farm-700 bg-farm-50 border-farm-200';
      case 'warning':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'alert':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getIconStyle = () => {
    switch (highlight) {
      case 'success':
        return 'bg-farm-100 text-farm-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'alert':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {value}
            </span>
            {unit && <span className="text-xs sm:text-sm font-semibold text-slate-500">{unit}</span>}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconStyle()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-slate-500 truncate font-normal">
            {subtitle}
          </span>
        )}
        {trend && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getBadgeStyle()}`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
