import type { Recall, RecallNotice } from '../../types';
import { addDays, generateId } from '../../utils/date';

const createNotices = (recallId: string): RecallNotice[] => {
  return [
    {
      id: generateId(),
      recallId,
      departmentId: 'd001',
      departmentName: '技术研发部',
      status: 'confirmed',
      sentAt: addDays(new Date(), -5).toString(),
      readAt: addDays(new Date(), -4.5).toString(),
      confirmedAt: addDays(new Date(), -4).toString(),
      confirmedQuantity: 2,
      remark: '已全部回收',
      contactPerson: '陈伟',
      sealCodes: ['HTZ-016', 'HTZ-017', 'HTZ-018', 'HTZ-019', 'HTZ-020'],
    },
    {
      id: generateId(),
      recallId,
      departmentId: 'd002',
      departmentName: '市场营销部',
      status: 'confirmed',
      sentAt: addDays(new Date(), -5).toString(),
      readAt: addDays(new Date(), -4.8).toString(),
      confirmedAt: addDays(new Date(), -3.5).toString(),
      confirmedQuantity: 3,
      remark: '已回收，无遗漏',
      contactPerson: '刘洋',
      sealCodes: ['HTZ-021', 'HTZ-022', 'HTZ-023', 'HTZ-024', 'HTZ-025'],
    },
    {
      id: generateId(),
      recallId,
      departmentId: 'd004',
      departmentName: '行政部',
      status: 'read',
      sentAt: addDays(new Date(), -5).toString(),
      readAt: addDays(new Date(), -3).toString(),
      contactPerson: '周敏',
      sealCodes: [],
    },
  ];
};

const createRecall002Notices = (): RecallNotice[] => {
  return [
    {
      id: generateId(),
      recallId: 'recall002',
      departmentId: 'd001',
      departmentName: '技术研发部',
      status: 'sent',
      sentAt: addDays(new Date(), -1).toString(),
      contactPerson: '陈伟',
      sealCodes: ['GZZ-021', 'GZZ-022'],
    },
    {
      id: generateId(),
      recallId: 'recall002',
      departmentId: 'd002',
      departmentName: '市场营销部',
      status: 'sent',
      sentAt: addDays(new Date(), -1).toString(),
      contactPerson: '刘洋',
      sealCodes: ['GZZ-023', 'GZZ-024', 'GZZ-025'],
    },
    {
      id: generateId(),
      recallId: 'recall002',
      departmentId: 'd003',
      departmentName: '财务部',
      status: 'sent',
      sentAt: addDays(new Date(), -1).toString(),
      contactPerson: '赵丽',
      sealCodes: ['GZZ-026', 'GZZ-027'],
    },
    {
      id: generateId(),
      recallId: 'recall002',
      departmentId: 'd004',
      departmentName: '行政部',
      status: 'sent',
      sentAt: addDays(new Date(), -1).toString(),
      contactPerson: '周敏',
      sealCodes: ['GZZ-028', 'GZZ-029', 'GZZ-030', 'GZZ-031'],
    },
    {
      id: generateId(),
      recallId: 'recall002',
      departmentId: 'd006',
      departmentName: '人力资源部',
      status: 'sent',
      sentAt: addDays(new Date(), -1).toString(),
      contactPerson: '钱进',
      sealCodes: ['GZZ-032', 'GZZ-033', 'GZZ-034', 'GZZ-035'],
    },
  ];
};

const createRecall003Notices = (): RecallNotice[] => {
  return [
    {
      id: generateId(),
      recallId: 'recall003',
      departmentId: 'd001',
      departmentName: '技术研发部',
      status: 'confirmed',
      sentAt: addDays(new Date(), -30).toString(),
      readAt: addDays(new Date(), -29).toString(),
      confirmedAt: addDays(new Date(), -28).toString(),
      confirmedQuantity: 2,
      remark: '已检查并重新发放',
      contactPerson: '陈伟',
      sealCodes: ['GZZ-001', 'GZZ-002'],
    },
    {
      id: generateId(),
      recallId: 'recall003',
      departmentId: 'd002',
      departmentName: '市场营销部',
      status: 'confirmed',
      sentAt: addDays(new Date(), -30).toString(),
      readAt: addDays(new Date(), -29.5).toString(),
      confirmedAt: addDays(new Date(), -27).toString(),
      confirmedQuantity: 3,
      remark: '已完成',
      contactPerson: '刘洋',
      sealCodes: ['GZZ-003', 'GZZ-004', 'GZZ-005'],
    },
  ];
};

export const mockRecalls: Recall[] = [
  {
    id: 'recall001',
    batchId: 'batch005',
    batchNo: 'BATCH-HT-2022-003',
    reason: '该批次印章材质存在质量问题，长期使用可能导致印章变形，影响文件法律效力。请各部门立即停止使用并配合回收。',
    status: 'in_progress',
    createdAt: addDays(new Date(), -5).toString(),
    initiatedBy: 'u007',
    initiatedByName: '孙强',
    priority: 'high',
    notices: createNotices('recall001'),
    sealCodes: ['HTZ-016', 'HTZ-017', 'HTZ-018', 'HTZ-019', 'HTZ-020', 'HTZ-021', 'HTZ-022', 'HTZ-023', 'HTZ-024', 'HTZ-025'],
  },
  {
    id: 'recall002',
    batchId: 'batch004',
    batchNo: 'BATCH-GZ-2023-001',
    reason: '该批次印章已过有效期，根据印章管理规定，需全部回收销毁并更换新批次印章。',
    status: 'pending',
    createdAt: addDays(new Date(), -1).toString(),
    initiatedBy: 'u007',
    initiatedByName: '孙强',
    priority: 'medium',
    notices: createRecall002Notices(),
    sealCodes: ['GZZ-021', 'GZZ-022', 'GZZ-023', 'GZZ-024', 'GZZ-025', 'GZZ-026', 'GZZ-027', 'GZZ-028', 'GZZ-029', 'GZZ-030', 'GZZ-031', 'GZZ-032', 'GZZ-033', 'GZZ-034', 'GZZ-035'],
  },
  {
    id: 'recall003',
    batchId: 'batch001',
    batchNo: 'BATCH-GZ-2024-001',
    reason: '发现编号GZZ-008印章有刻制瑕疵，涉及该批次部分印章，需召回检查后重新发放。',
    status: 'completed',
    createdAt: addDays(new Date(), -30).toString(),
    initiatedBy: 'u007',
    initiatedByName: '孙强',
    priority: 'low',
    notices: createRecall003Notices(),
    sealCodes: ['GZZ-001', 'GZZ-002', 'GZZ-003', 'GZZ-004', 'GZZ-005'],
  },
];

export const getRecallById = (id: string): Recall | undefined => {
  return mockRecalls.find(recall => recall.id === id);
};

export const getOngoingRecalls = (): Recall[] => {
  return mockRecalls.filter(recall => recall.status === 'in_progress' || recall.status === 'pending');
};
