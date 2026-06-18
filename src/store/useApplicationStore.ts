import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SealApplication, ApprovalNode, ReminderRecord } from '../types';
import { mockApplications, getApplicationById, getOverdueApplications } from '../mock/data/applications';
import { generateId, addHours, getOverdueHours } from '../utils/date';
import { mockUsers } from '../mock/data/users';
import { useOverdueRuleStore } from './useOverdueRuleStore';

interface ApplicationState {
  applications: SealApplication[];
  loading: boolean;
  error: string | null;
  fetchApplications: () => void;
  getApplication: (id: string) => SealApplication | undefined;
  createApplication: (data: Partial<SealApplication>) => SealApplication;
  approveNode: (applicationId: string, nodeId: string, comment?: string) => void;
  rejectNode: (applicationId: string, nodeId: string, comment: string) => void;
  sendReminder: (nodeId: string, type: 'normal' | 'escalation', escalateTo?: string) => void;
  getOverdueList: () => SealApplication[];
  updateOverdueStatus: () => void;
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: mockApplications,
      loading: false,
      error: null,

      fetchApplications: () => {
        set({ applications: mockApplications });
      },

      getApplication: (id) => {
        return get().applications.find(app => app.id === id) || getApplicationById(id);
      },

      createApplication: (data) => {
        const applicant = mockUsers[0];
        const urgency = (data.urgency || 'normal') as 'normal' | 'urgent' | 'emergency';
        const rule = useOverdueRuleStore.getState().getRuleByUrgency(urgency);
        const now = new Date();

        const approvalNodes: ApprovalNode[] = [
          {
            id: generateId(),
            applicationId: '',
            approverId: 'u004',
            approverName: '陈伟',
            nodeName: '部门主管审批',
            orderIndex: 0,
            status: 'pending',
            deadline: addHours(now, rule.firstReminderHours),
            isOverdue: false,
            isEscalated: false,
            overdueHours: 0,
            reminders: [],
          },
          {
            id: generateId(),
            applicationId: '',
            approverId: 'u008',
            approverName: '周敏',
            nodeName: '行政复核',
            orderIndex: 1,
            status: 'pending',
            deadline: addHours(now, rule.firstReminderHours * 2),
            isOverdue: false,
            isEscalated: false,
            overdueHours: 0,
            reminders: [],
          },
          {
            id: generateId(),
            applicationId: '',
            approverId: 'u007',
            approverName: '孙强',
            nodeName: '印章管理员用印',
            orderIndex: 2,
            status: 'pending',
            deadline: addHours(now, rule.firstReminderHours * 3),
            isOverdue: false,
            isEscalated: false,
            overdueHours: 0,
            reminders: [],
          },
        ];

        const newApp: SealApplication = {
          id: `app-${generateId()}`,
          applicantId: applicant.id,
          applicantName: applicant.name,
          department: applicant.department,
          reason: data.reason || '',
          sealId: data.sealId || 'seal001',
          sealName: data.sealName || '公司公章',
          sealType: data.sealType || 'company',
          copies: data.copies || 1,
          status: 'pending',
          attachments: data.attachments || [],
          createdAt: now.toISOString(),
          currentNodeIndex: 0,
          approvalNodes,
          urgency: data.urgency || 'normal',
        };

        approvalNodes.forEach(node => {
          node.applicationId = newApp.id;
        });

        set(state => ({
          applications: [newApp, ...state.applications],
        }));

        return newApp;
      },

      approveNode: (applicationId, nodeId, comment) => {
        set(state => ({
          applications: state.applications.map(app => {
            if (app.id !== applicationId) return app;
            
            const updatedNodes = app.approvalNodes.map(node => {
              if (node.id !== nodeId) return node;
              return {
                ...node,
                status: 'approved' as const,
                approvedAt: new Date().toISOString(),
                comment: comment || node.comment,
              };
            });

            const currentNode = updatedNodes.find(n => n.id === nodeId);
            const nextIndex = currentNode ? currentNode.orderIndex + 1 : app.currentNodeIndex + 1;
            const allApproved = updatedNodes.every(n => n.status === 'approved');

            return {
              ...app,
              approvalNodes: updatedNodes,
              currentNodeIndex: allApproved ? updatedNodes.length : nextIndex,
              status: allApproved ? 'completed' : app.status,
            };
          }),
        }));
      },

      rejectNode: (applicationId, nodeId, comment) => {
        set(state => ({
          applications: state.applications.map(app => {
            if (app.id !== applicationId) return app;
            
            return {
              ...app,
              status: 'rejected',
              approvalNodes: app.approvalNodes.map(node => {
                if (node.id !== nodeId) return node;
                return {
                  ...node,
                  status: 'rejected' as const,
                  approvedAt: new Date().toISOString(),
                  comment,
                };
              }),
            };
          }),
        }));
      },

      sendReminder: (nodeId, type, escalateTo) => {
        set(state => ({
          applications: state.applications.map(app => {
            const node = app.approvalNodes.find(n => n.id === nodeId);
            if (!node) return app;

            const escalatedUser = escalateTo ? mockUsers.find(u => u.id === escalateTo) : undefined;
            const now = new Date().toISOString();
            const reminder: ReminderRecord = {
              id: generateId(),
              nodeId,
              type,
              content: type === 'escalation'
                ? `审批已超时${node.overdueHours}小时，已升级至上级领导`
                : `您的用印审批已超时${node.overdueHours}小时，请尽快处理`,
              sentAt: now,
              escalatedTo: escalateTo,
              escalatedToName: escalatedUser?.name,
            };

            return {
              ...app,
              approvalNodes: app.approvalNodes.map(n => {
                if (n.id !== nodeId) return n;
                const updated: ApprovalNode = {
                  ...n,
                  reminders: [...n.reminders, reminder],
                };
                if (type === 'escalation') {
                  updated.isEscalated = true;
                  updated.status = 'escalated';
                  updated.escalatedAt = now;
                  updated.escalatedTo = escalateTo;
                  updated.escalatedToName = escalatedUser?.name || '上级领导';
                }
                return updated;
              }),
            };
          }),
        }));
      },

      getOverdueList: () => {
        return get().applications.filter(app =>
          app.approvalNodes.some(node => 
            node.isOverdue && node.orderIndex === app.currentNodeIndex && 
            (node.status === 'pending' || node.status === 'escalated')
          )
        );
      },

      updateOverdueStatus: () => {
        set(state => {
          let hasChanges = false;
          const newApplications = state.applications.map(app => {
            if (app.status !== 'pending') return app;
            
            const rule = useOverdueRuleStore.getState().getRuleByUrgency(app.urgency);
            let appChanged = false;
            const newNodes = app.approvalNodes.map(node => {
              if (node.status !== 'pending') return node;
              if (node.orderIndex !== app.currentNodeIndex) return node;
              
              const overdueHours = getOverdueHours(node.deadline);
              const newIsOverdue = overdueHours > 0;
              
              let updatedNode = { ...node };
              let nodeChanged = false;
              
              if (node.isOverdue !== newIsOverdue || node.overdueHours !== overdueHours) {
                updatedNode.isOverdue = newIsOverdue;
                updatedNode.overdueHours = overdueHours;
                nodeChanged = true;
              }
              
              if (newIsOverdue) {
                const normalReminders = node.reminders.filter(r => r.type === 'normal');
                const hasEscalated = node.reminders.some(r => r.type === 'escalation');
                const secondReminderOffset = rule.secondReminderHours - rule.firstReminderHours;
                const escalationOffset = rule.escalationHours - rule.firstReminderHours;

                if (normalReminders.length === 0) {
                  const reminder: ReminderRecord = {
                    id: generateId(),
                    nodeId: node.id,
                    type: 'normal',
                    content: `您的用印审批已超时${overdueHours.toFixed(1)}小时，请尽快处理（一级催办）`,
                    sentAt: new Date().toISOString(),
                  };
                  updatedNode.reminders = [...node.reminders, reminder];
                  nodeChanged = true;
                }
                
                if (overdueHours >= secondReminderOffset && normalReminders.length === 1) {
                  const reminder: ReminderRecord = {
                    id: generateId(),
                    nodeId: node.id,
                    type: 'normal',
                    content: `重要提醒：用印审批已超时${overdueHours.toFixed(1)}小时，请立即处理（二级催办）`,
                    sentAt: new Date().toISOString(),
                  };
                  updatedNode.reminders = [...updatedNode.reminders, reminder];
                  nodeChanged = true;
                }
                
                if (overdueHours >= escalationOffset && !hasEscalated) {
                  const escalationUser = mockUsers.find(u => u.id === rule.escalationRoleId);
                  const now = new Date().toISOString();
                  const reminder: ReminderRecord = {
                    id: generateId(),
                    nodeId: node.id,
                    type: 'escalation',
                    content: `审批已超时${overdueHours.toFixed(1)}小时，已自动升级至${rule.escalationRoleName}`,
                    sentAt: now,
                    escalatedTo: rule.escalationRoleId,
                    escalatedToName: rule.escalationRoleName,
                  };
                  updatedNode.isEscalated = true;
                  updatedNode.status = 'escalated';
                  updatedNode.escalatedAt = now;
                  updatedNode.escalatedTo = rule.escalationRoleId;
                  updatedNode.escalatedToName = rule.escalationRoleName;
                  updatedNode.reminders = [...updatedNode.reminders, reminder];
                  nodeChanged = true;
                }
              }
              
              if (nodeChanged) {
                appChanged = true;
                hasChanges = true;
                return updatedNode;
              }
              return node;
            });
            
            if (appChanged) {
              return { ...app, approvalNodes: newNodes };
            }
            return app;
          });
          
          if (!hasChanges) return state;
          return { applications: newApplications };
        });
      },
    }),
    {
      name: 'application-storage',
    }
  )
);
