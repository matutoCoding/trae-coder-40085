export interface User {
  id: string;
  name: string;
  role: 'employee' | 'approver' | 'seal_admin' | 'system_admin';
  department: string;
  departmentId: string;
  email: string;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  manager: string;
  managerId: string;
  location: string;
  memberCount: number;
}

export interface ReminderRecord {
  id: string;
  nodeId: string;
  type: 'normal' | 'escalation';
  content: string;
  sentAt: string;
  escalatedTo?: string;
  escalatedToName?: string;
}

export interface ApprovalNode {
  id: string;
  applicationId: string;
  approverId: string;
  approverName: string;
  nodeName: string;
  orderIndex: number;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  deadline: string;
  approvedAt?: string;
  comment?: string;
  isOverdue: boolean;
  isEscalated: boolean;
  overdueHours: number;
  reminders: ReminderRecord[];
}

export interface SealApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  department: string;
  reason: string;
  sealId: string;
  sealName: string;
  sealType: string;
  copies: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  attachments: string[];
  createdAt: string;
  currentNodeIndex: number;
  approvalNodes: ApprovalNode[];
  urgency: 'normal' | 'urgent' | 'emergency';
}

export interface Seal {
  id: string;
  batchId: string;
  sealCode: string;
  sealName: string;
  sealType: string;
  status: 'in_stock' | 'in_use' | 'recalled' | 'expired' | 'destroyed';
  currentHolder?: string;
  currentDepartment?: string;
  receivedDate?: string;
}

export interface SealFlow {
  id: string;
  batchId: string;
  departmentId: string;
  departmentName: string;
  quantity: number;
  flowDate: string;
  operator: string;
  seals: string[];
  recipient: string;
}

export interface SealBatch {
  id: string;
  batchNo: string;
  sealType: string;
  sealName: string;
  manufactureDate: string;
  expiryDate: string;
  totalQuantity: number;
  remainingQuantity: number;
  status: 'active' | 'expired' | 'recalled' | 'destroyed';
  remark?: string;
  flows: SealFlow[];
  seals: Seal[];
}

export interface RecallNotice {
  id: string;
  recallId: string;
  departmentId: string;
  departmentName: string;
  status: 'sent' | 'read' | 'confirmed' | 'rejected';
  sentAt: string;
  readAt?: string;
  confirmedAt?: string;
  confirmedQuantity?: number;
  remark?: string;
  contactPerson?: string;
}

export interface Recall {
  id: string;
  batchId: string;
  batchNo: string;
  reason: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  initiatedBy: string;
  initiatedByName: string;
  priority: 'high' | 'medium' | 'low';
  notices: RecallNotice[];
}

export interface OverdueStat {
  userId: string;
  userName: string;
  department: string;
  overdueCount: number;
  totalOverdueHours: number;
  avgOverdueHours: number;
}

export interface DashboardStats {
  pendingApplications: number;
  overdueTasks: number;
  activeBatches: number;
  ongoingRecalls: number;
  monthlyApplications: number[];
  departmentStats: { name: string; count: number }[];
  topOverduePersons: OverdueStat[];
}

export type ApplicationStatus = SealApplication['status'];
export type NodeStatus = ApprovalNode['status'];
export type SealStatus = Seal['status'];
export type BatchStatus = SealBatch['status'];
export type RecallStatus = Recall['status'];
