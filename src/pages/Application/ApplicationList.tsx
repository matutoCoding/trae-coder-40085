import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useApplicationStore } from '../../store/useApplicationStore';
import { formatDateTime, formatRemainingTime } from '../../utils/date';
import { applicationStatusConfig, urgencyConfig } from '../../utils/status';
import type { SealApplication } from '../../types';

const ApplicationList: React.FC = () => {
  const navigate = useNavigate();
  const applications = useApplicationStore(state => state.applications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantName.includes(searchTerm) ||
      app.sealName.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || app.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const columns = [
    {
      key: 'reason',
      title: '用印事由',
      width: '30%',
      render: (item: SealApplication) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-500" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate max-w-md">
              {item.reason.substring(0, 30)}...
            </p>
            <p className="text-xs text-gray-500">
              {item.applicantName} · {item.department}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'sealName',
      title: '印章类型',
      render: (item: SealApplication) => (
        <div>
          <p className="font-medium text-gray-900">{item.sealName}</p>
          <p className="text-xs text-gray-500">{item.copies} 份</p>
        </div>
      ),
    },
    {
      key: 'urgency',
      title: '紧急程度',
      render: (item: SealApplication) => {
        const config = urgencyConfig[item.urgency];
        return (
          <Badge
            variant={item.urgency === 'emergency' ? 'danger' : item.urgency === 'urgent' ? 'warning' : 'default'}
          >
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      title: '状态',
      render: (item: SealApplication) => {
        const config = applicationStatusConfig[item.status];
        const variant = item.status === 'approved' || item.status === 'completed'
          ? 'success'
          : item.status === 'rejected'
          ? 'danger'
          : item.status === 'cancelled'
          ? 'default'
          : 'warning';
        return <Badge variant={variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'currentNode',
      title: '当前节点',
      render: (item: SealApplication) => {
        if (item.status !== 'pending') return <span className="text-gray-400">-</span>;
        const currentNode = item.approvalNodes[item.currentNodeIndex];
        if (!currentNode) return <span className="text-gray-400">-</span>;

        const isOverdue = currentNode.isOverdue;
        return (
          <div>
            <div className="flex items-center gap-2">
              {isOverdue ? (
                <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
              ) : (
                <Clock className="h-4 w-4 text-gray-400" />
              )}
              <span className={`text-sm ${isOverdue ? 'text-amber-600 font-medium' : 'text-gray-700'}`}>
                {currentNode.nodeName}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isOverdue ? 'text-amber-500' : 'text-gray-400'}`}>
              {formatRemainingTime(currentNode.deadline)}
            </p>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      title: '申请时间',
      render: (item: SealApplication) => (
        <span className="text-sm text-gray-600">{formatDateTime(item.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: '100px',
      render: (item: SealApplication) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/applications/${item.id}`);
          }}
        >
          详情
        </Button>
      ),
    },
  ];

  const statCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved' || a.status === 'completed').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索事由、申请人、印章..."
              className="w-80 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="input-field w-32 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">全部状态 ({statCounts.all})</option>
              <option value="pending">审批中 ({statCounts.pending})</option>
              <option value="approved">已通过 ({statCounts.approved})</option>
              <option value="rejected">已驳回 ({statCounts.rejected})</option>
            </select>
            <select
              className="input-field w-28 text-sm"
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
            >
              <option value="all">全部紧急度</option>
              <option value="normal">普通</option>
              <option value="urgent">紧急</option>
              <option value="emergency">特急</option>
            </select>
          </div>
        </div>
        <Button onClick={() => navigate('/applications/new')}>
          <Plus className="h-4 w-4 mr-2" />
          新建申请
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '全部申请', count: statCounts.all, icon: FileText, color: 'primary' },
          { label: '审批中', count: statCounts.pending, icon: Clock, color: 'warning' },
          { label: '已通过', count: statCounts.approved, icon: CheckCircle, color: 'success' },
          { label: '已驳回', count: statCounts.rejected, icon: XCircle, color: 'danger' },
        ].map((item, index) => (
          <div
            key={item.label}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              statusFilter === (item.label === '全部申请' ? 'all' : item.label.toLowerCase())
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white'
            }`}
            onClick={() =>
              setStatusFilter(item.label === '全部申请' ? 'all' : item.label.toLowerCase())
            }
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                item.color === 'primary' ? 'bg-primary-100' :
                item.color === 'warning' ? 'bg-amber-100' :
                item.color === 'success' ? 'bg-emerald-100' : 'bg-rose-100'
              }`}>
                <item.icon className={`h-5 w-5 ${
                  item.color === 'primary' ? 'text-primary-600' :
                  item.color === 'warning' ? 'text-amber-600' :
                  item.color === 'success' ? 'text-emerald-600' : 'text-rose-600'
                }`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 font-serif">{item.count}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Table
        columns={columns}
        data={filteredApplications}
        onRowClick={(item) => navigate(`/applications/${item.id}`)}
        emptyText="暂无用印申请"
      />
    </div>
  );
};

export default ApplicationList;
