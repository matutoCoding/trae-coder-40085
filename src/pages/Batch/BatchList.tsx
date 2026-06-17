import React, { useState, useMemo } from 'react';
import { Package, AlertTriangle, Calendar, Search, Filter, Plus, ChevronRight, PackageCheck, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { StatusDot } from '../../components/common/StatusDot';
import { StatCard } from '../../components/common/StatCard';
import { Progress } from '../../components/ui/Progress';
import { useBatchStore } from '../../store/useBatchStore';
import { formatDate, getDaysUntilExpiry, getExpiryStatus } from '../../utils/date';
import { batchStatusConfig, sealStatusConfig } from '../../utils/status';
import type { SealBatch } from '../../types';

const BatchList: React.FC = () => {
  const navigate = useNavigate();
  const { batches, getExpiringBatches, getActiveBatches, updateBatchStatus } = useBatchStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'recalled'>('all');
  const [filterType, setFilterType] = useState<'all' | 'company' | 'contract' | 'finance'>('all');

  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      const matchSearch = searchTerm === '' ||
        batch.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.sealName.includes(searchTerm) ||
        batch.remark?.includes(searchTerm);
      const matchStatus = filterStatus === 'all' || batch.status === filterStatus;
      const matchType = filterType === 'all' || batch.sealType === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [batches, searchTerm, filterStatus, filterType]);

  const stats = useMemo(() => {
    const active = getActiveBatches().length;
    const expiring = getExpiringBatches(30).length;
    const expired = batches.filter(b => b.status === 'expired').length;
    const recalled = batches.filter(b => b.status === 'recalled').length;
    const totalSeals = batches.reduce((sum, b) => sum + b.totalQuantity, 0);
    const usedSeals = batches.reduce((sum, b) => sum + (b.totalQuantity - b.remainingQuantity), 0);
    return { active, expiring, expired, recalled, totalSeals, usedSeals };
  }, [batches, getActiveBatches, getExpiringBatches]);

  const sealTypeNames: Record<string, string> = {
    company: '公司公章',
    contract: '合同专用章',
    finance: '财务专用章',
  };

  const columns: Column<SealBatch>[] = [
    {
      key: 'batchNo',
      title: '批次信息',
      width: '200px',
      render: (batch) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 font-mono text-sm">
            {batch.batchNo}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info" size="sm">
              {sealTypeNames[batch.sealType] || batch.sealType}
            </Badge>
            <span className="text-sm text-gray-500">{batch.sealName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      title: '库存情况',
      width: '180px',
      render: (batch) => {
        const used = batch.totalQuantity - batch.remainingQuantity;
        const usageRate = (used / batch.totalQuantity) * 100;
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">已用 {used}/{batch.totalQuantity}</span>
              <span className="text-gray-500">剩余 {batch.remainingQuantity}</span>
            </div>
            <Progress
              value={usageRate}
              variant={usageRate > 80 ? 'warning' : 'default'}
              size="sm"
            />
          </div>
        );
      },
    },
    {
      key: 'expiry',
      title: '效期管理',
      width: '200px',
      render: (batch) => {
        const daysUntil = getDaysUntilExpiry(batch.expiryDate);
        const expiryStatus = getExpiryStatus(batch.expiryDate);
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                至 {formatDate(batch.expiryDate)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {expiryStatus.status === 'expired' ? (
                <>
                  <StatusDot status="danger" pulse />
                  <span className="text-sm text-red-600 font-medium">已过期</span>
                </>
              ) : expiryStatus.status === 'expiring' ? (
                <>
                  <StatusDot status="warning" pulse />
                  <span className="text-sm text-amber-600 font-medium">
                    还剩 {daysUntil} 天
                  </span>
                </>
              ) : (
                <>
                  <StatusDot status="success" />
                  <span className="text-sm text-green-600 font-medium">
                    还剩 {daysUntil} 天
                  </span>
                </>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'flows',
      title: '流向记录',
      width: '120px',
      render: (batch) => (
        <div className="text-center">
          <div className="font-semibold text-lg text-gray-800">
            {batch.flows.length}
          </div>
          <div className="text-xs text-gray-500">次发放</div>
          {batch.flows.length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              涉及 {new Set(batch.flows.map(f => f.departmentId)).size} 个部门
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: '100px',
      render: (batch) => {
        const config = batchStatusConfig[batch.status];
        return (
          <Badge variant={config.variant} className="justify-center w-full">
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: '150px',
      render: (batch) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/batches/${batch.id}`)}
          >
            详情
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          {batch.status === 'active' && getDaysUntilExpiry(batch.expiryDate) <= 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => updateBatchStatus(batch.id, 'expired')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">印章批次管理</h1>
          <p className="text-gray-500 mt-1">管理印章批次信息、效期监控和库存追踪</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/batches/new')}>
          <Plus className="w-4 h-4 mr-2" />
          新建批次
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <StatCard
          title="有效批次"
          value={stats.active}
          icon={<PackageCheck className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title="即将过期"
          value={stats.expiring}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="已过期"
          value={stats.expired}
          icon={<Clock className="w-5 h-5" />}
          variant="danger"
        />
        <StatCard
          title="已召回"
          value={stats.recalled}
          icon={<Trash2 className="w-5 h-5" />}
          variant="info"
        />
        <StatCard
          title="印章使用率"
          value={`${((stats.usedSeals / stats.totalSeals) * 100).toFixed(1)}%`}
          icon={<Package className="w-5 h-5" />}
          variant="info"
        />
      </div>

      {stats.expiring > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-amber-800">
                有 {stats.expiring} 个批次即将在30天内过期
              </div>
              <div className="text-sm text-amber-600">
                请及时处理过期印章，避免影响正常使用
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilterStatus('active')}
            >
              查看详情
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>批次筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索批次号、印章名称..."
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
                <option value="active">有效</option>
                <option value="expired">已过期</option>
                <option value="recalled">已召回</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              >
                <option value="all">全部类型</option>
                <option value="company">公司公章</option>
                <option value="contract">合同专用章</option>
                <option value="finance">财务专用章</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>批次列表</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredBatches}
            columns={columns}
            rowKey={(batch) => batch.id}
            emptyText="暂无批次数据"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchList;
