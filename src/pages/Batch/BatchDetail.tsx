import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, User, MapPin, FileText, AlertTriangle, Send, Plus, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select, TextArea } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { StatusDot } from '../../components/common/StatusDot';
import { Progress } from '../../components/ui/Progress';
import { Timeline, TimelineItem } from '../../components/ui/Timeline';
import { useBatchStore } from '../../store/useBatchStore';
import { formatDate, formatDateTime, getDaysUntilExpiry, getExpiryStatus, generateId } from '../../utils/date';
import { batchStatusConfig, sealStatusConfig, noticeStatusConfig } from '../../utils/status';
import { mockDepartments } from '../../mock/data/users';
import type { Seal, SealFlow } from '../../types';

const BatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBatch, recordFlow } = useBatchStore();
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [flowForm, setFlowForm] = useState({
    departmentId: '',
    quantity: 1,
    recipient: '',
    seals: [] as string[],
  });

  const batch = getBatch(id || '');

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">批次不存在</p>
        <Button variant="primary" onClick={() => navigate('/batches')}>
          返回列表
        </Button>
      </div>
    );
  }

  const used = batch.totalQuantity - batch.remainingQuantity;
  const usageRate = (used / batch.totalQuantity) * 100;
  const daysUntil = getDaysUntilExpiry(batch.expiryDate);
  const expiryStatus = getExpiryStatus(batch.expiryDate);

  const sealTypeNames: Record<string, string> = {
    company: '公司公章',
    contract: '合同专用章',
    finance: '财务专用章',
  };

  const mapFlowToTimeline = (flows: SealFlow[]): TimelineItem[] => {
    return flows.map((flow, index) => ({
      id: flow.id || `flow-${index}`,
      status: 'completed' as const,
      title: flow.departmentName,
      subtitle: `发放 ${flow.quantity} 枚印章`,
      time: formatDateTime(flow.flowDate),
      description: `经办人：${flow.operator}，领取人：${flow.recipient}`,
    })).reverse();
  };

  const sealColumns: Column<Seal>[] = [
    {
      key: 'sealCode',
      title: '印章编号',
      render: (seal) => (
        <span className="font-mono text-sm text-gray-800">{seal.sealCode}</span>
      ),
    },
    {
      key: 'sealName',
      title: '印章名称',
      render: (seal) => <span className="text-gray-700">{seal.sealName}</span>,
    },
    {
      key: 'status',
      title: '状态',
      render: (seal) => {
        const config = sealStatusConfig[seal.status];
        return (
          <Badge variant={config.variant} size="sm">
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'holder',
      title: '当前持有人',
      render: (seal) => (
        <span className="text-gray-600">
          {seal.currentHolder || seal.currentDepartment || '-'}
        </span>
      ),
    },
    {
      key: 'receivedDate',
      title: '领用日期',
      render: (seal) => (
        <span className="text-gray-500 text-sm">
          {seal.receivedDate ? formatDate(seal.receivedDate) : '-'}
        </span>
      ),
    },
  ];

  const handleSubmitFlow = () => {
    if (!flowForm.departmentId || !flowForm.recipient) return;
    const dept = mockDepartments.find(d => d.id === flowForm.departmentId);
    recordFlow(batch.id, {
      departmentId: flowForm.departmentId,
      departmentName: dept?.name || '',
      quantity: flowForm.quantity,
      flowDate: new Date().toISOString(),
      operator: '孙强',
      seals: flowForm.seals,
      recipient: flowForm.recipient,
    });
    setShowFlowModal(false);
    setFlowForm({ departmentId: '', quantity: 1, recipient: '', seals: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/batches')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-serif">批次详情</h1>
          <p className="text-gray-500 mt-1 font-mono">{batch.batchNo}</p>
        </div>
        <Badge variant={batchStatusConfig[batch.status].variant} size="lg">
          {batchStatusConfig[batch.status].label}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">批次号</label>
                    <div className="font-medium text-gray-900 font-mono">{batch.batchNo}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">印章类型</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="info" size="sm">
                        {sealTypeNames[batch.sealType]}
                      </Badge>
                      <span className="text-gray-700">{batch.sealName}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">制造日期</label>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(batch.manufactureDate)}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">有效期至</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={`font-medium ${
                        expiryStatus.status === 'expired' ? 'text-red-600' :
                        expiryStatus.status === 'expiring' ? 'text-amber-600' : 'text-gray-700'
                      }`}>
                        {formatDate(batch.expiryDate)}
                      </span>
                      {expiryStatus.status === 'expired' && (
                        <Badge variant="danger" size="sm">已过期</Badge>
                      )}
                      {expiryStatus.status === 'expiring' && (
                        <Badge variant="warning" size="sm">还剩 {daysUntil} 天</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">库存情况</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">已用 {used}/{batch.totalQuantity} 枚</span>
                        <span className="text-gray-500">剩余 {batch.remainingQuantity} 枚</span>
                      </div>
                      <Progress
                        value={usageRate}
                        variant={usageRate > 80 ? 'warning' : 'default'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">备注</label>
                    <div className="text-gray-700">{batch.remark || '-'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>流向记录</CardTitle>
              {batch.status === 'active' && batch.remainingQuantity > 0 && (
                <Button variant="primary" size="sm" onClick={() => setShowFlowModal(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  发放印章
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {batch.flows.length > 0 ? (
                <Timeline items={mapFlowToTimeline(batch.flows)} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>暂无流向记录</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>印章清单</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table
                data={batch.seals}
                columns={sealColumns}
                rowKey={(seal) => seal.id}
                emptyText="暂无印章数据"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => navigate(`/trace?batchNo=${batch.batchNo}`)}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                追踪批次流向
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => navigate(`/recalls/new?batchId=${batch.id}`)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                发起召回
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>发放统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(new Set(batch.flows.map(f => f.departmentId))).map(deptId => {
                  const deptFlows = batch.flows.filter(f => f.departmentId === deptId);
                  const totalQty = deptFlows.reduce((sum, f) => sum + f.quantity, 0);
                  const deptName = deptFlows[0]?.departmentName || '';
                  return (
                    <div key={deptId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{deptName}</span>
                      </div>
                      <Badge variant="info">{totalQty} 枚</Badge>
                    </div>
                  );
                })}
                {batch.flows.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    暂无发放记录
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>效期预警</CardTitle>
            </CardHeader>
            <CardContent>
              {expiryStatus.status === 'normal' && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-700">效期正常</div>
                    <div className="text-sm text-green-600">
                      还剩 {daysUntil} 天过期
                    </div>
                  </div>
                </div>
              )}
              {expiryStatus.status === 'expiring' && (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-700">即将过期</div>
                    <div className="text-sm text-amber-600">
                      还有 {daysUntil} 天过期，请及时处理
                    </div>
                  </div>
                </div>
              )}
              {expiryStatus.status === 'expired' && (
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-700">已过期</div>
                    <div className="text-sm text-red-600">
                      该批次印章已过期 {Math.abs(daysUntil)} 天，请立即回收销毁
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showFlowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">发放印章</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  发放部门
                </label>
                <Select
                  value={flowForm.departmentId}
                  onChange={(e) => setFlowForm({ ...flowForm, departmentId: e.target.value })}
                >
                  <option value="">请选择部门</option>
                  {mockDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  发放数量（剩余 {batch.remainingQuantity} 枚）
                </label>
                <Input
                  type="number"
                  min={1}
                  max={batch.remainingQuantity}
                  value={flowForm.quantity}
                  onChange={(e) => setFlowForm({ ...flowForm, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  领取人
                </label>
                <Input
                  placeholder="请输入领取人姓名"
                  value={flowForm.recipient}
                  onChange={(e) => setFlowForm({ ...flowForm, recipient: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowFlowModal(false)}>
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitFlow}
                disabled={!flowForm.departmentId || !flowForm.recipient}
              >
                <Plus className="w-4 h-4 mr-2" />
                确认发放
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDetail;
