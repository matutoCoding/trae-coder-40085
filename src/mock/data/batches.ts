import type { SealBatch, Seal, SealFlow } from '../../types';
import { addDays, addYears, generateId } from '../../utils/date';

const createSeals = (batchId: string, count: number, prefix: string, startIndex: number = 0): Seal[] => {
  const seals: Seal[] = [];
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
  return seals;
};

const createFlows = (batchId: string): SealFlow[] => {
  return [
    {
      id: generateId(),
      batchId,
      departmentId: 'd001',
      departmentName: '技术研发部',
      quantity: 2,
      flowDate: addDays(new Date(), -30).toString(),
      operator: '孙强',
      seals: [],
      recipient: '陈伟',
    },
    {
      id: generateId(),
      batchId,
      departmentId: 'd002',
      departmentName: '市场营销部',
      quantity: 3,
      flowDate: addDays(new Date(), -25).toString(),
      operator: '孙强',
      seals: [],
      recipient: '刘洋',
    },
    {
      id: generateId(),
      batchId,
      departmentId: 'd003',
      departmentName: '财务部',
      quantity: 2,
      flowDate: addDays(new Date(), -20).toString(),
      operator: '孙强',
      seals: [],
      recipient: '赵丽',
    },
  ];
};

export const mockBatches: SealBatch[] = [
  {
    id: 'batch001',
    batchNo: 'BATCH-GZ-2024-001',
    sealType: 'company',
    sealName: '公司公章',
    manufactureDate: addDays(new Date(), -365).toString(),
    expiryDate: addYears(new Date(), 4).toString(),
    totalQuantity: 20,
    remainingQuantity: 13,
    status: 'active',
    remark: '2024年度第一批次公章',
    flows: createFlows('batch001'),
    seals: createSeals('batch001', 20, 'GZZ'),
  },
  {
    id: 'batch002',
    batchNo: 'BATCH-HT-2024-001',
    sealType: 'contract',
    sealName: '合同专用章',
    manufactureDate: addDays(new Date(), -300).toString(),
    expiryDate: addYears(new Date(), 3).toString(),
    totalQuantity: 15,
    remainingQuantity: 10,
    status: 'active',
    remark: '2024年度合同专用章',
    flows: [
      {
        id: generateId(),
        batchId: 'batch002',
        departmentId: 'd002',
        departmentName: '市场营销部',
        quantity: 3,
        flowDate: addDays(new Date(), -15).toString(),
        operator: '孙强',
        seals: [],
        recipient: '刘洋',
      },
      {
        id: generateId(),
        batchId: 'batch002',
        departmentId: 'd001',
        departmentName: '技术研发部',
        quantity: 2,
        flowDate: addDays(new Date(), -10).toString(),
        operator: '孙强',
        seals: [],
        recipient: '陈伟',
      },
    ],
    seals: createSeals('batch002', 15, 'HTZ'),
  },
  {
    id: 'batch003',
    batchNo: 'BATCH-CW-2023-002',
    sealType: 'finance',
    sealName: '财务专用章',
    manufactureDate: addDays(new Date(), -500).toString(),
    expiryDate: addDays(new Date(), 15).toString(),
    totalQuantity: 10,
    remainingQuantity: 4,
    status: 'active',
    remark: '即将到期，请及时更换',
    flows: [
      {
        id: generateId(),
        batchId: 'batch003',
        departmentId: 'd003',
        departmentName: '财务部',
        quantity: 6,
        flowDate: addDays(new Date(), -200).toString(),
        operator: '孙强',
        seals: [],
        recipient: '赵丽',
      },
    ],
    seals: createSeals('batch003', 10, 'CZY'),
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
    flows: createFlows('batch004'),
    seals: createSeals('batch004', 15, 'GZZ', 20),
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
    flows: [
      {
        id: generateId(),
        batchId: 'batch005',
        departmentId: 'd002',
        departmentName: '市场营销部',
        quantity: 5,
        flowDate: addDays(new Date(), -400).toString(),
        operator: '孙强',
        seals: [],
        recipient: '刘洋',
      },
      {
        id: generateId(),
        batchId: 'batch005',
        departmentId: 'd004',
        departmentName: '行政部',
        quantity: 5,
        flowDate: addDays(new Date(), -350).toString(),
        operator: '孙强',
        seals: [],
        recipient: '周敏',
      },
    ],
    seals: createSeals('batch005', 10, 'HTZ', 15),
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
