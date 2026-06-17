import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle, Search, Filter, Plus, ChevronRight, User, Calendar, Package, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { Progress } from '../../components/ui/Progress';
import { StatusDot } from '../../components/common/StatusDot';
import { StatCard } from '../../components/common/StatCard';
import { useRecallStore } from '../../store/useRecallStore';
import { formatDate, formatDateTime } from '../../utils/date';
import { recallStatusConfig, priorityConfig, noticeStatusConfig } from '../../utils/status';
import type { Recall } from '../../types';

const RecallList: React.FC = () => {
  const navigate = useNavigate();
  const { recalls, getOngoingRecalls } = useRecallStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredRecalls = useMemo(() => {
    return recalls.filter(recall => {
      const matchSearch = searchTerm === '' ||
        recall.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recall.reason.includes(searchTerm) ||
        recall.initiatedByName.includes(searchTerm);
      const matchStatus = filterStatus === 'all' || recall.status === filterStatus;
      const matchPriority = filterPriority === 'all' || recall.priority === filterPriority;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [recalls, searchTerm, filterStatus, filterPriority]);

  const stats = useMemo(() => {
    const ongoing = getOngoingRecalls().length;
    const highPriority = recalls.filter(r => r.priority === 'high' && r.status !== 'completed').length;
    const completed = recalls.filter(r => r.status === 'completed').length;
    const totalNotices = recalls.reduce((sum, r) => sum + r.notices.length, 0);
    const confirmedNotices = recalls.reduce((sum, r) => sum + r.notices.filter(n => n.status === 'confirmed').length, 0);
    return { ongoing, highPriority, completed, totalNotices, confirmedNotices };
  }, [recalls, getOngoingRecalls]);

  const getRecallProgress = (recall: Recall) => {
    if (recall.notices.length === 0) return 0;
    const confirmed = recall.notices.filter(n => n.status === 'confirmed').length;
    return (confirmed / recall.notices.length) * 100;
  };

  const columns: Column<Recall>[] = [
    {
      key: 'batch',
      title: '召回批次',
      width: '220px',
      render: (recall) => (
        <div className="space-y-1">
          <div className="font-mono text-sm font-medium text-gray-900">
            {recall.batchNo}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={priorityConfig[recall.priority].variant} size="sm">
              {priorityConfig[recall.priority].label}
            </Badge>
            <Badge variant={recallStatusConfig[recall.status].variant} size="sm">
              {recallStatusConfig[recall.status].label}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      title: '召回原因',
      width: '280px',
      render: (recall) => (
        <div className="space-y-1">
          <div className="text-sm text-gray-700 line-clamp-2">
            {recall.reason}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <User className="w-3 h-3" />
            <span>发起人：{recall.initiatedByName}</span>
            <span>·</span>
            <Calendar className="w-3 h-3" />
            <span>{formatDate(recall.createdAt)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'progress',
      title: '召回进度',
      width: '180px',
      render: (recall) => {
        const progress = getRecallProgress(recall);
        const confirmed = recall.notices.filter(n => n.status === 'confirmed').length;
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">已确认 {confirmed}/{recall.notices.length}</span>
              <span className="text-gray-500">{progress.toFixed(0)}%</span>
            </div>
            <Progress
              value={progress}
              variant={progress === 100 ? 'success' : progress > 50 ? 'default' : 'warning'}
              size="sm"
            />
          </div>
        );
      },
    },
    {
      key: 'notices',
      title: '通知状态',
      width: '180px',
      render: (recall) => {
        const sent = recall.notices.filter(n => n.status === 'sent').length;
        const read = recall.notices.filter(n => n.status === 'read').length;
        const confirmed = recall.notices.filter(n => n.status === 'confirmed').length;
        return (
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="font-semibold text-gray-700">{sent}</div>
              <div className="text-xs text-gray-400">待读</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-amber-600">{read}</div>
              <div className="text-xs text-gray-400">已读</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{confirmed}</div>
              <div className="text-xs text-gray-400">已确认</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: '120px',
      render: (recall) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/recalls/${recall.id}`)}
        >
          详情
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">召回管理</h1>
          <p className="text-gray-500 mt-1">管理问题印章召回流程，追踪各部门确认状态</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/recalls/new')}>
          <Plus className="w-4 h-4 mr-2" />
          发起召回
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="进行中召回"
          value={stats.ongoing}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="高优先级"
          value={stats.highPriority}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="danger"
        />
        <StatCard
          title="已完成召回"
          value={stats.completed}
          icon={<CheckCircle className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title="通知确认率"
          value={`${stats.totalNotices > 0 ? ((stats.confirmedNotices / stats.totalNotices) * 100).toFixed(1) : 0}%`}
          icon={<Clock className="w-5 h-5" />}
          variant="info"
        />
      </div>

      {stats.highPriority > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-red-800">
                有 {stats.highPriority} 个高优先级召回待处理
              </div>
              <div className="text-sm text-red-600">
                请尽快跟进高优先级召回，确保问题印章及时回收
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setFilterPriority('high')}
            >
              立即处理
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索批次号、召回原因、发起人..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)}
              >
                <option value="all">全部优先级</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>召回列表</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredRecalls}
            columns={columns}
            rowKey={(recall) => recall.id}
            emptyText="暂无召回记录"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RecallList;
