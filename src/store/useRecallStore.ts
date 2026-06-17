import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recall, RecallNotice } from '../types';
import { mockRecalls, getRecallById } from '../mock/data/recalls';
import { generateId } from '../utils/date';
import { mockDepartments } from '../mock/data/users';

interface RecallState {
  recalls: Recall[];
  loading: boolean;
  error: string | null;
  fetchRecalls: () => void;
  getRecall: (id: string) => Recall | undefined;
  createRecall: (data: {
    batchId: string;
    batchNo: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    departmentIds: string[];
  }) => Recall;
  updateRecallStatus: (id: string, status: Recall['status']) => void;
  updateNoticeStatus: (
    recallId: string,
    noticeId: string,
    status: RecallNotice['status'],
    confirmedQuantity?: number,
    remark?: string
  ) => void;
  getOngoingRecalls: () => Recall[];
}

export const useRecallStore = create<RecallState>()(
  persist(
    (set, get) => ({
      recalls: mockRecalls,
      loading: false,
      error: null,

      fetchRecalls: () => {
        set({ recalls: mockRecalls });
      },

      getRecall: (id) => {
        return get().recalls.find(r => r.id === id) || getRecallById(id);
      },

      createRecall: (data) => {
        const notices: RecallNotice[] = data.departmentIds.map(deptId => {
          const dept = mockDepartments.find(d => d.id === deptId);
          return {
            id: generateId(),
            recallId: '',
            departmentId: deptId,
            departmentName: dept?.name || '',
            status: 'sent',
            sentAt: new Date().toISOString(),
            contactPerson: dept?.manager,
          };
        });

        const newRecall: Recall = {
          id: `recall-${generateId()}`,
          batchId: data.batchId,
          batchNo: data.batchNo,
          reason: data.reason,
          status: 'in_progress',
          createdAt: new Date().toISOString(),
          initiatedBy: 'u007',
          initiatedByName: '孙强',
          priority: data.priority,
          notices,
        };

        notices.forEach(n => {
          n.recallId = newRecall.id;
        });

        set(state => ({
          recalls: [newRecall, ...state.recalls],
        }));

        return newRecall;
      },

      updateRecallStatus: (id, status) => {
        set(state => ({
          recalls: state.recalls.map(recall =>
            recall.id === id ? { ...recall, status } : recall
          ),
        }));
      },

      updateNoticeStatus: (recallId, noticeId, status, confirmedQuantity, remark) => {
        const now = new Date().toISOString();
        set(state => ({
          recalls: state.recalls.map(recall => {
            if (recall.id !== recallId) return recall;

            const updatedNotices = recall.notices.map(notice => {
              if (notice.id !== noticeId) return notice;
              return {
                ...notice,
                status,
                readAt: status === 'read' || status === 'confirmed' ? now : notice.readAt,
                confirmedAt: status === 'confirmed' ? now : notice.confirmedAt,
                confirmedQuantity: confirmedQuantity ?? notice.confirmedQuantity,
                remark: remark ?? notice.remark,
              };
            });

            const allConfirmed = updatedNotices.every(n => n.status === 'confirmed');
            return {
              ...recall,
              notices: updatedNotices,
              status: allConfirmed ? 'completed' : recall.status,
            };
          }),
        }));
      },

      getOngoingRecalls: () => {
        return get().recalls.filter(r =>
          r.status === 'in_progress' || r.status === 'pending'
        );
      },
    }),
    {
      name: 'recall-storage',
    }
  )
);
