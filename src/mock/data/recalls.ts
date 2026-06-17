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
    },
    {
      id: generateId(),
      recallId,
      departmentId: 'd003',
      departmentName: '财务部',
      status: 'read',
      sentAt: addDays(new Date(), -5).toString(),
      readAt: addDays(new Date(), -3).toString(),
      contactPerson: '赵丽',
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
    notices: [
      {
        id: generateId(),
        recallId: 'recall002',
        departmentId: 'd001',
        departmentName: '技术研发部',
        status: 'sent',
        sentAt: addDays(new Date(), -1).toString(),
        contactPerson: '陈伟',
      },
      {
        id: generateId(),
        recallId: 'recall002',
        departmentId: 'd002',
        departmentName: '市场营销部',
        status: 'sent',
        sentAt: addDays(new Date(), -1).toString(),
        contactPerson: '刘洋',
      },
      {
        id: generateId(),
        recallId: 'recall002',
        departmentId: 'd003',
        departmentName: '财务部',
        status: 'sent',
        sentAt: addDays(new Date(), -1).toString(),
        contactPerson: '赵丽',
      },
    ],
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
    notices: [
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
      },
    ],
  },
];

export const getRecallById = (id: string): Recall | undefined => {
  return mockRecalls.find(recall => recall.id === id);
};

export const getOngoingRecalls = (): Recall[] => {
  return mockRecalls.filter(recall => recall.status === 'in_progress' || recall.status === 'pending');
};
