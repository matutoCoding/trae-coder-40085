import type { ApplicationStatus, NodeStatus, SealStatus, BatchStatus, RecallStatus } from '../types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'amber' | 'orange';
type StatusConfig = { label: string; color: string; bgColor: string; variant: BadgeVariant };

export const applicationStatusConfig: Record<ApplicationStatus, StatusConfig> = {
  pending: { label: '审批中', color: 'text-amber-700', bgColor: 'bg-amber-50', variant: 'warning' },
  approved: { label: '已通过', color: 'text-emerald-700', bgColor: 'bg-emerald-50', variant: 'success' },
  rejected: { label: '已驳回', color: 'text-rose-700', bgColor: 'bg-rose-50', variant: 'danger' },
  completed: { label: '已完成', color: 'text-sky-700', bgColor: 'bg-sky-50', variant: 'info' },
  cancelled: { label: '已取消', color: 'text-gray-700', bgColor: 'bg-gray-50', variant: 'default' },
};

export const nodeStatusConfig: Record<NodeStatus, StatusConfig> = {
  pending: { label: '待处理', color: 'text-amber-700', bgColor: 'bg-amber-50', variant: 'warning' },
  approved: { label: '已通过', color: 'text-emerald-700', bgColor: 'bg-emerald-50', variant: 'success' },
  rejected: { label: '已驳回', color: 'text-rose-700', bgColor: 'bg-rose-50', variant: 'danger' },
  escalated: { label: '已升级', color: 'text-orange-700', bgColor: 'bg-orange-50', variant: 'orange' },
};

export const sealStatusConfig: Record<SealStatus, StatusConfig> = {
  in_stock: { label: '在库', color: 'text-emerald-700', bgColor: 'bg-emerald-50', variant: 'success' },
  in_use: { label: '领用中', color: 'text-sky-700', bgColor: 'bg-sky-50', variant: 'info' },
  recalled: { label: '已召回', color: 'text-amber-700', bgColor: 'bg-amber-50', variant: 'warning' },
  expired: { label: '已过期', color: 'text-gray-700', bgColor: 'bg-gray-50', variant: 'default' },
  destroyed: { label: '已销毁', color: 'text-rose-700', bgColor: 'bg-rose-50', variant: 'danger' },
};

export const batchStatusConfig: Record<BatchStatus, StatusConfig> = {
  active: { label: '有效', color: 'text-emerald-700', bgColor: 'bg-emerald-50', variant: 'success' },
  expired: { label: '已过期', color: 'text-gray-700', bgColor: 'bg-gray-50', variant: 'default' },
  recalled: { label: '已召回', color: 'text-amber-700', bgColor: 'bg-amber-50', variant: 'warning' },
  destroyed: { label: '已销毁', color: 'text-rose-700', bgColor: 'bg-rose-50', variant: 'danger' },
};

export const recallStatusConfig: Record<RecallStatus, StatusConfig> = {
  pending: { label: '待处理', color: 'text-amber-700', bgColor: 'bg-amber-50', variant: 'warning' },
  in_progress: { label: '进行中', color: 'text-sky-700', bgColor: 'bg-sky-50', variant: 'info' },
  completed: { label: '已完成', color: 'text-emerald-700', bgColor: 'bg-emerald-50', variant: 'success' },
  cancelled: { label: '已取消', color: 'text-gray-700', bgColor: 'bg-gray-50', variant: 'default' },
};

export const urgencyConfig: Record<string, StatusConfig> = {
  normal: { label: '普通', color: 'text-gray-700', bgColor: 'bg-gray-50', variant: 'default' },
  urgent: { label: '紧急', color: 'text-amber-700', bgColor: 'bg-amber-50', variant: 'warning' },
  emergency: { label: '特急', color: 'text-rose-700', bgColor: 'bg-rose-50', variant: 'danger' },
};

export const noticeStatusConfig: Record<string, StatusConfig> = {
  sent: { label: '已发送', color: 'text-sky-700', bgColor: 'bg-sky-50', variant: 'info' },
  read: { label: '已读', color: 'text-amber-700', bgColor: 'bg-amber-50', variant: 'warning' },
  confirmed: { label: '已确认', color: 'text-emerald-700', bgColor: 'bg-emerald-50', variant: 'success' },
  rejected: { label: '已拒绝', color: 'text-rose-700', bgColor: 'bg-rose-50', variant: 'danger' },
};

export const priorityConfig: Record<string, StatusConfig> = {
  high: { label: '高优先级', color: 'text-rose-700', bgColor: 'bg-rose-50', variant: 'danger' },
  medium: { label: '中优先级', color: 'text-amber-700', bgColor: 'bg-amber-50', variant: 'warning' },
  low: { label: '低优先级', color: 'text-gray-700', bgColor: 'bg-gray-50', variant: 'info' },
};
