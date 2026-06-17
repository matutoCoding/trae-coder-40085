import type { SealBatch, Seal, SealFlow } from '../../types';
import { addDays, addYears, generateId } from '../../utils/date';

interface FlowConfig {
  departmentId: string;
  departmentName: string;
  quantity: number;
  daysAgo: number;
  recipient: string;
}

const createSealsWithFlows = (
  batchId: string,
  count: number,
  prefix: string,
  startIndex: number = 0,
  flowConfigs: FlowConfig[] = []
): { seals: Seal[]; flows: SealFlow[] } => {
  const seals: Seal[] = [];
  const flows: SealFlow[] = [];
  let sealIndex = 0;

  for (let i = 0; i < count; i++) {
    const code = `${prefix}-${String(startIndex + i + 1).padStart(3, '0')}`;
    seals.push({
      id: `seal-${batchId}-${i}`,
      batchId,
      sealCode: code,
      sealName: `${prefix}章`,
      sealType: prefix === 'GZZ' ? 'company' : prefix === 'HTZ' ? 'contract' : 'finance',
      status: 'in_stock',
    });
  }

  for (const config of flowConfigs) {
    const flowSeals: string[] = [];
    const flowDate = addDays(new Date(), -config.daysAgo).toString();
    let allocated = 0;

    while (allocated < config.quantity && sealIndex < seals.length) {
      const seal = seals[sealIndex];
      if (seal.status === 'in_stock') {
        seal.status = 'in_use';
        seal.currentDepartment = config.departmentName;
        seal.currentHolder = config.recipient;
        seal.receivedDate = flowDate;
        flowSeals.push(seal.id);
        allocated++;
      }
      sealIndex++;
    }

    flows.push({
      id: generateId(),
      batchId,
      departmentId: config.departmentId,
      departmentName: config.departmentName,
      quantity: config.quantity,
      flowDate,
      operator: '孙强',
      seals: flowSeals,
      recipient: config.recipient,
    });
  }

  return { seals, flows };
};

const batch001Data = createSealsWithFlows('batch001', 20, 'GZZ', 0, [
  { departmentId: 'd001', departmentName: '技术研发部', quantity: 2, daysAgo: 30, recipient: '陈伟' },
  { departmentId: 'd002', departmentName: '市场营销部', quantity: 3, daysAgo: 25, recipient: '刘洋' },
  { departmentId: 'd003', departmentName: '财务部', quantity: 2, daysAgo: 20, recipient: '赵丽' },
]);

const batch002Data = createSealsWithFlows('batch002', 15, 'HTZ', 0, [
  { departmentId: 'd002', departmentName: '市场营销部', quantity: 3, daysAgo: 15, recipient: '刘洋' },
  { departmentId: 'd001', departmentName: '技术研发部', quantity: 2, daysAgo: 10, recipient: '陈伟' },
]);

const batch003Data = createSealsWithFlows('batch003', 10, 'CZY', 0, [
  { departmentId: 'd003', departmentName: '财务部', quantity: 6, daysAgo: 200, recipient: '赵丽' },
]);

const batch004Data = createSealsWithFlows('batch004', 15, 'GZZ', 20, [
  { departmentId: 'd001', departmentName: '技术研发部', quantity: 2, daysAgo: 365 + 30, recipient: '陈伟' },
  { departmentId: 'd002', departmentName: '市场营销部', quantity: 3, daysAgo: 365 + 25, recipient: '刘洋' },
  { departmentId: 'd003', departmentName: '财务部', quantity: 2, daysAgo: 365 + 20, recipient: '赵丽' },
  { departmentId: 'd004', departmentName: '行政部', quantity: 4, daysAgo: 365 + 15, recipient: '周敏' },
  { departmentId: 'd006', departmentName: '人力资源部', quantity: 4, daysAgo: 365 + 10, recipient: '钱进' },
]);

const batch005Data = createSealsWithFlows('batch005', 10, 'HTZ', 15, [
  { departmentId: 'd002', departmentName: '市场营销部', quantity: 5, daysAgo: 400, recipient: '刘洋' },
  { departmentId: 'd004', departmentName: '行政部', quantity: 5, daysAgo: 350, recipient: '周敏' },
]);

export const mockBatches: SealBatch[] = [
  {
    id: 'batch001',
    batchNo: 'BATCH-GZ-2024-001',
    sealType: 'company',
    sealName: '公司公章',
    manufactureDate: addDays(new Date(), -365).toString(),
    expiryDate: addYears(new Date(), 4).toString(),
    totalQuantity: 20,
    remainingQuantity: 20 - 7,
    status: 'active',
    remark: '2024年度第一批次公章',
    flows: batch001Data.flows,
    seals: batch001Data.seals,
  },
  {
    id: 'batch002',
    batchNo: 'BATCH-HT-2024-001',
    sealType: 'contract',
    sealName: '合同专用章',
    manufactureDate: addDays(new Date(), -300).toString(),
    expiryDate: addYears(new Date(), 3).toString(),
    totalQuantity: 15,
    remainingQuantity: 15 - 5,
    status: 'active',
    remark: '2024年度合同专用章',
    flows: batch002Data.flows,
    seals: batch002Data.seals,
  },
  {
    id: 'batch003',
    batchNo: 'BATCH-CW-2023-002',
    sealType: 'finance',
    sealName: '财务专用章',
    manufactureDate: addDays(new Date(), -500).toString(),
    expiryDate: addDays(new Date(), 15).toString(),
    totalQuantity: 10,
    remainingQuantity: 10 - 6,
    status: 'active',
    remark: '即将到期，请及时更换',
    flows: batch003Data.flows,
    seals: batch003Data.seals,
  },
  {
    id: 'batch004',
    batchNo: 'BATCH-GZ-2023-001',
    sealType: 'company',
    sealName: '公司公章',
    manufactureDate: addDays(new Date(), -700).toString(),
    expiryDate: addDays(new Date(), -30).toString(),
    totalQuantity: 15,
    remainingQuantity: 0,
    status: 'expired',
    remark: '已过期，需全部回收销毁',
    flows: batch004Data.flows,
    seals: batch004Data.seals.map(s => ({ ...s, status: 'expired' as const })),
  },
  {
    id: 'batch005',
    batchNo: 'BATCH-HT-2022-003',
    sealType: 'contract',
    sealName: '合同专用章',
    manufactureDate: addDays(new Date(), -800).toString(),
    expiryDate: addDays(new Date(), -100).toString(),
    totalQuantity: 10,
    remainingQuantity: 0,
    status: 'recalled',
    remark: '因材质问题已召回',
    flows: batch005Data.flows,
    seals: batch005Data.seals.map(s => ({ ...s, status: 'recalled' as const })),
  },
];

export const getBatchById = (id: string): SealBatch | undefined => {
  return mockBatches.find(batch => batch.id === id);
};

export const getBatchByNo = (batchNo: string): SealBatch | undefined => {
  return mockBatches.find(batch => batch.batchNo === batchNo);
};

export const getActiveBatches = (): SealBatch[] => {
  return mockBatches.filter(batch => batch.status === 'active');
};

export const getExpiringBatches = (days: number = 30): SealBatch[] => {
  const now = new Date().getTime();
  const threshold = now + days * 24 * 60 * 60 * 1000;
  return mockBatches.filter(batch => {
    const expiry = new Date(batch.expiryDate).getTime();
    return expiry > now && expiry <= threshold;
  });
};
