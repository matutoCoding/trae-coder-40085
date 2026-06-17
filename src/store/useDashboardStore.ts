import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DashboardStats, OverdueStat } from '../types';
import { mockApplications } from '../mock/data/applications';
import { mockBatches } from '../mock/data/batches';
import { mockRecalls } from '../mock/data/recalls';

interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  fetchStats: () => void;
}

const calculateStats = (): DashboardStats => {
  const pendingApplications = mockApplications.filter(
    app => app.status === 'pending'
  ).length;

  const overdueTasks = mockApplications.filter(app =>
    app.approvalNodes.some(node => node.isOverdue)
  ).length;

  const activeBatches = mockBatches.filter(b => b.status === 'active').length;

  const ongoingRecalls = mockRecalls.filter(
    r => r.status === 'in_progress' || r.status === 'pending'
  ).length;

  const monthlyApplications = [12, 19, 15, 25, 22, 30, 28, 35, 40, 38, 45, 42];

  const departmentStats = [
    { name: '技术研发部', count: 45 },
    { name: '市场营销部', count: 38 },
    { name: '财务部', count: 25 },
    { name: '人力资源部', count: 18 },
    { name: '行政部', count: 12 },
  ];

  const overdueMap = new Map<string, OverdueStat>();
  mockApplications.forEach(app => {
    app.approvalNodes.forEach(node => {
      if (node.isOverdue) {
        const existing = overdueMap.get(node.approverId) || {
          userId: node.approverId,
          userName: node.approverName,
          department: app.department,
          overdueCount: 0,
          totalOverdueHours: 0,
          avgOverdueHours: 0,
        };
        existing.overdueCount += 1;
        existing.totalOverdueHours += node.overdueHours;
        existing.avgOverdueHours = Math.round(
          existing.totalOverdueHours / existing.overdueCount
        );
        overdueMap.set(node.approverId, existing);
      }
    });
  });

  const topOverduePersons = Array.from(overdueMap.values())
    .sort((a, b) => b.overdueCount - a.overdueCount)
    .slice(0, 5);

  return {
    pendingApplications,
    overdueTasks,
    activeBatches,
    ongoingRecalls,
    monthlyApplications,
    departmentStats,
    topOverduePersons,
  };
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      stats: calculateStats(),
      loading: false,

      fetchStats: () => {
        set({ stats: calculateStats() });
      },
    }),
    {
      name: 'dashboard-storage',
    }
  )
);
