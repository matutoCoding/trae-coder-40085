import React, { useMemo } from 'react';
import { Bell, Search, Settings } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useApplicationStore } from '../../store/useApplicationStore';
import { useRecallStore } from '../../store/useRecallStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const applications = useApplicationStore(state => state.applications);
  const recalls = useRecallStore(state => state.recalls);
  
  const alertCount = useMemo(() => {
    const overdueCount = applications.filter(app =>
      app.status === 'pending' &&
      app.approvalNodes.some(node => 
        node.isOverdue && 
        node.orderIndex === app.currentNodeIndex && 
        node.status === 'pending'
      )
    ).length;
    const ongoingCount = recalls.filter(
      r => r.status === 'in_progress' || r.status === 'pending'
    ).length;
    return overdueCount + ongoingCount;
  }, [applications, recalls]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-bold text-gray-900 font-serif">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索申请、批号..."
            className="w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <Badge
              variant="danger"
              className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center p-0 text-[10px]"
            >
              {alertCount}
            </Badge>
          )}
        </button>

        <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
