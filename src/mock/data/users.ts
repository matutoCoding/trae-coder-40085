import type { User } from '../../types';

export const mockUsers: User[] = [
  {
    id: 'u001',
    name: '张明',
    role: 'employee',
    department: '技术研发部',
    departmentId: 'd001',
    email: 'zhangming@company.com',
  },
  {
    id: 'u002',
    name: '李华',
    role: 'employee',
    department: '市场营销部',
    departmentId: 'd002',
    email: 'lihua@company.com',
  },
  {
    id: 'u003',
    name: '王芳',
    role: 'employee',
    department: '财务部',
    departmentId: 'd003',
    email: 'wangfang@company.com',
  },
  {
    id: 'u004',
    name: '陈伟',
    role: 'approver',
    department: '技术研发部',
    departmentId: 'd001',
    email: 'chenwei@company.com',
  },
  {
    id: 'u005',
    name: '刘洋',
    role: 'approver',
    department: '市场营销部',
    departmentId: 'd002',
    email: 'liuyang@company.com',
  },
  {
    id: 'u006',
    name: '赵丽',
    role: 'approver',
    department: '财务部',
    departmentId: 'd003',
    email: 'zhaoli@company.com',
  },
  {
    id: 'u007',
    name: '孙强',
    role: 'seal_admin',
    department: '行政部',
    departmentId: 'd004',
    email: 'sunqiang@company.com',
  },
  {
    id: 'u008',
    name: '周敏',
    role: 'approver',
    department: '行政部',
    departmentId: 'd004',
    email: 'zhoumin@company.com',
  },
  {
    id: 'u009',
    name: '吴涛',
    role: 'system_admin',
    department: '信息技术部',
    departmentId: 'd005',
    email: 'wutao@company.com',
  },
  {
    id: 'u010',
    name: '郑洁',
    role: 'employee',
    department: '人力资源部',
    departmentId: 'd006',
    email: 'zhengjie@company.com',
  },
  {
    id: 'u011',
    name: '钱进',
    role: 'approver',
    department: '人力资源部',
    departmentId: 'd006',
    email: 'qianjin@company.com',
  },
  {
    id: 'u012',
    name: '王总',
    role: 'approver',
    department: '总经理办公室',
    departmentId: 'd007',
    email: 'wangzong@company.com',
  },
];

export const mockDepartments = [
  { id: 'd001', name: '技术研发部', manager: '陈伟', managerId: 'u004', location: 'A座3楼', memberCount: 25 },
  { id: 'd002', name: '市场营销部', manager: '刘洋', managerId: 'u005', location: 'A座5楼', memberCount: 18 },
  { id: 'd003', name: '财务部', manager: '赵丽', managerId: 'u006', location: 'B座2楼', memberCount: 12 },
  { id: 'd004', name: '行政部', manager: '周敏', managerId: 'u008', location: 'B座1楼', memberCount: 8 },
  { id: 'd005', name: '信息技术部', manager: '吴涛', managerId: 'u009', location: 'A座4楼', memberCount: 15 },
  { id: 'd006', name: '人力资源部', manager: '钱进', managerId: 'u011', location: 'B座3楼', memberCount: 10 },
  { id: 'd007', name: '总经理办公室', manager: '王总', managerId: 'u012', location: 'A座8楼', memberCount: 5 },
];

export const getCurrentUser = (): User => mockUsers[0];

export const getUserById = (id: string): User | undefined => mockUsers.find(u => u.id === id);
