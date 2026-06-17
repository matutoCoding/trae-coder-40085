import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SealBatch, SealFlow } from '../types';
import { mockBatches, getBatchById, getBatchByNo } from '../mock/data/batches';
import { generateId } from '../utils/date';

interface BatchState {
  batches: SealBatch[];
  loading: boolean;
  error: string | null;
  fetchBatches: () => void;
  getBatch: (id: string) => SealBatch | undefined;
  getBatchByNo: (batchNo: string) => SealBatch | undefined;
  createBatch: (data: Partial<SealBatch>) => SealBatch;
  updateBatch: (id: string, data: Partial<SealBatch>) => void;
  deleteBatch: (id: string) => void;
  recordFlow: (batchId: string, flow: Omit<SealFlow, 'id' | 'batchId'>) => void;
  updateBatchStatus: (id: string, status: SealBatch['status']) => void;
  getActiveBatches: () => SealBatch[];
  getExpiringBatches: (days?: number) => SealBatch[];
  traceBatchFlow: (batchNo: string) => SealFlow[] | null;
}

export const useBatchStore = create<BatchState>()(
  persist(
    (set, get) => ({
      batches: mockBatches,
      loading: false,
      error: null,

      fetchBatches: () => {
        set({ batches: mockBatches });
      },

      getBatch: (id) => {
        return get().batches.find(b => b.id === id) || getBatchById(id);
      },

      getBatchByNo: (batchNo) => {
        return get().batches.find(b => b.batchNo === batchNo) || getBatchByNo(batchNo);
      },

      createBatch: (data) => {
        const newBatch: SealBatch = {
          id: `batch-${generateId()}`,
          batchNo: data.batchNo || `BATCH-${Date.now()}`,
          sealType: data.sealType || 'company',
          sealName: data.sealName || '公司公章',
          manufactureDate: data.manufactureDate || new Date().toISOString(),
          expiryDate: data.expiryDate || new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          totalQuantity: data.totalQuantity || 10,
          remainingQuantity: data.totalQuantity || 10,
          status: 'active',
          remark: data.remark,
          flows: [],
          seals: data.seals || [],
        };

        set(state => ({
          batches: [newBatch, ...state.batches],
        }));

        return newBatch;
      },

      updateBatch: (id, data) => {
        set(state => ({
          batches: state.batches.map(batch =>
            batch.id === id ? { ...batch, ...data } : batch
          ),
        }));
      },

      deleteBatch: (id) => {
        set(state => ({
          batches: state.batches.filter(batch => batch.id !== id),
        }));
      },

      recordFlow: (batchId, flow) => {
        const newFlow: SealFlow = {
          ...flow,
          id: generateId(),
          batchId,
        };

        set(state => ({
          batches: state.batches.map(batch => {
            if (batch.id !== batchId) return batch;
            return {
              ...batch,
              remainingQuantity: batch.remainingQuantity - flow.quantity,
              flows: [...batch.flows, newFlow],
            };
          }),
        }));
      },

      updateBatchStatus: (id, status) => {
        set(state => ({
          batches: state.batches.map(batch =>
            batch.id === id ? { ...batch, status } : batch
          ),
        }));
      },

      getActiveBatches: () => {
        return get().batches.filter(b => b.status === 'active');
      },

      getExpiringBatches: (days = 30) => {
        const now = new Date().getTime();
        const threshold = now + days * 24 * 60 * 60 * 1000;
        return get().batches.filter(batch => {
          const expiry = new Date(batch.expiryDate).getTime();
          return expiry > now && expiry <= threshold;
        });
      },

      traceBatchFlow: (batchNo) => {
        const batch = get().getBatchByNo(batchNo);
        return batch ? batch.flows : null;
      },
    }),
    {
      name: 'batch-storage',
    }
  )
);
