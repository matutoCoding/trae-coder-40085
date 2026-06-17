import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
}

const colorStyles = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-rose-50 text-rose-600',
  info: 'bg-sky-50 text-sky-600',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  variant,
  onClick,
}) => {
  const actualColor = variant || color;
  return (
    <Card
      className={cn('p-5 cursor-pointer', onClick && 'hover:shadow-lg')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 font-serif">{value}</p>
          {trend && (
            <div
              className={cn(
                'mt-2 flex items-center text-sm',
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
              <span className="ml-1 text-gray-400">较上月</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            colorStyles[actualColor]
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
