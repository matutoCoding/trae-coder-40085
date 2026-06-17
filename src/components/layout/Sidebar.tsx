import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Package,
  Search,
  RefreshCw,
  ChevronLeft,
  Stamp,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    path: '/',
    label: '仪表盘',
    icon: LayoutDashboard,
  },
  {
    path: '/applications',
    label: '用印申请',
    icon: FileText,
  },
  {
    path: '/reminders',
    label: '超时催办',
    icon: AlertTriangle,
  },
  {
    path: '/batches',
    label: '印章批次',
    icon: Package,
  },
  {
    path: '/trace',
    label: '流向追踪',
    icon: Search,
  },
  {
    path: '/recalls',
    label: '召回管理',
    icon: RefreshCw,
  },
  {
    path: '/settings/overdue-rules',
    label: '规则配置',
    icon: Settings,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-primary-500 text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-primary-600 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Stamp className="h-8 w-8" />
            <span className="font-serif text-xl font-bold">印章管理</span>
          </div>
        )}
        {collapsed && <Stamp className="mx-auto h-8 w-8" />}
        <button
          onClick={onToggle}
          className="rounded p-1.5 hover:bg-primary-600 transition-colors"
        >
          <ChevronLeft
            className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      <nav className="mt-4 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 animate-fade-in-up',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-primary-100 hover:bg-white/5 hover:text-white',
                collapsed && 'justify-center'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-amber-400')} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-primary-600 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-400 flex items-center justify-center text-sm font-semibold">
              张
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">张明</p>
              <p className="text-xs text-primary-200 truncate">技术研发部</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
