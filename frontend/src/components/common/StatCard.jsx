import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  trendPositive = true,
  color = 'primary', // 'primary', 'success', 'warning', 'error', 'info'
  className = ''
}) => {
  const iconColors = {
    primary: 'bg-blue-50 text-primary',
    success: 'bg-emerald-50 text-success',
    warning: 'bg-amber-50 text-warning',
    error: 'bg-red-50 text-error',
    info: 'bg-sky-50 text-info'
  };

  return (
    <div className={`bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm flex items-start justify-between ${className}`}>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">{title}</p>
        <div className="text-2xl font-bold text-[#0F172A]">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 pt-1 text-xs">
            {trend && (
              <span className={`font-semibold ${trendPositive ? 'text-success' : 'text-error'}`}>
                {trend}
              </span>
            )}
            {subtitle && <span className="text-[#64748B]">{subtitle}</span>}
          </div>
        )}
      </div>
      {Icon && (
        <div className={`p-3 rounded-lg flex items-center justify-center ${iconColors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
