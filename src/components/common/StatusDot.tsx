import React from 'react';
import { cn } from '../../lib/utils';

interface StatusDotProps {
  status: 'success' | 'warning' | 'danger' | 'info' | 'default';
  pulse?: boolean;
  className?: string;
}

const colorMap = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  default: 'bg-gray-400',
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  pulse = false,
  className,
}) => {
  return (
    <span
      className={cn(
        'relative inline-flex h-2 w-2 rounded-full',
        colorMap[status],
        pulse && 'animate-pulse',
        className
      )}
    >
      {pulse && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75',
            colorMap[status],
            'animate-ping'
          )}
        />
      )}
    </span>
  );
};
