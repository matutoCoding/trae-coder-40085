import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import type { ApprovalNode } from '../../types';
import { formatDateTime } from '../../utils/date';

export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  time?: string;
  status: 'completed' | 'current' | 'pending' | 'rejected' | 'overdue';
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const statusConfig = {
  completed: {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    lineColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  current: {
    icon: Clock,
    iconColor: 'text-primary-500',
    lineColor: 'bg-gray-200',
    bgColor: 'bg-primary-50',
  },
  pending: {
    icon: Clock,
    iconColor: 'text-gray-400',
    lineColor: 'bg-gray-200',
    bgColor: 'bg-gray-50',
  },
  rejected: {
    icon: XCircle,
    iconColor: 'text-rose-500',
    lineColor: 'bg-gray-200',
    bgColor: 'bg-rose-50',
  },
  overdue: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    lineColor: 'bg-gray-200',
    bgColor: 'bg-amber-50',
  },
};

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn('relative', className)}>
      {items.map((item, index) => {
        const config = statusConfig[item.status];
        const Icon = config.icon;
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <div
                className={cn(
                  'absolute left-3 top-8 w-0.5 h-full -translate-x-1/2',
                  config.lineColor
                )}
              />
            )}
            <div
              className={cn(
                'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                config.bgColor
              )}
            >
              <Icon className={cn('h-4 w-4', config.iconColor)} />
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                {item.time && (
                  <span className="text-xs text-gray-500">{item.time}</span>
                )}
              </div>
              {item.subtitle && (
                <p className="mt-0.5 text-sm text-gray-500">{item.subtitle}</p>
              )}
              {item.description && (
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const mapApprovalNodesToTimeline = (
  nodes: ApprovalNode[],
  currentIndex: number
): TimelineItem[] => {
  return nodes.map((node, index) => {
    let status: TimelineItem['status'] = 'pending';

    if (node.status === 'approved') {
      status = 'completed';
    } else if (node.status === 'rejected') {
      status = 'rejected';
    } else if (node.isOverdue) {
      status = 'overdue';
    } else if (index === currentIndex) {
      status = 'current';
    }

    return {
      id: node.id,
      title: node.nodeName,
      subtitle: node.approverName,
      description: node.comment,
      time: node.approvedAt ? formatDateTime(node.approvedAt) : undefined,
      status,
    };
  });
};
