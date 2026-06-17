import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, User, MapPin, FileText, AlertTriangle, Send, Plus, TrendingUp, CheckCircle, XCircle, Hash, ChevronDown, ChevronRight, Layers, List } from 'lucide-react';
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
  const [flowError, setFlowError] = useState('');
  const [sealViewMode, setSealViewMode] = useState<'list' | 'group'>('list');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [flowForm, setFlowForm] = useState({
    departmentId: '',
    quantity: 1,
    recipient: '',
    autoAssign: true,
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
      key: 'department',
      title: '当前部门',
      render: (seal) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-600">
            {seal.currentDepartment || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'holder',
      title: '领取人',
      render: (seal) => (
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-600">
            {seal.currentHolder || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'receivedDate',
      title: '领用日期',
      render: (seal) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500 text-sm">
            {seal.receivedDate ? formatDate(seal.receivedDate) : '-'}
          </span>
        </div>
      ),
    },
  ];

  const inStockSeals = useMemo(() => {
    return batch ? batch.seals.filter(s => s.status === 'in_stock') : [];
  }, [batch]);

  const sealsByDepartment = useMemo(() => {
    const groups: Record<string, { deptName: string; seals: Seal[] }> = {};
    const inStockKey = '__in_stock__';
    groups[inStockKey] = { deptName: '在库印章', seals: [] };

    if (!batch) return groups;

    batch.seals.forEach(seal => {
      if (seal.status === 'in_stock') {
        groups[inStockKey].seals.push(seal);
      } else if (seal.currentDepartment) {
        if (!groups[seal.currentDepartment]) {
          groups[seal.currentDepartment] = {
            deptName: seal.currentDepartment,
            seals: [],
          };
        }
        groups[seal.currentDepartment].seals.push(seal);
      }
    });

    return groups;
  }, [batch]);

  const toggleDeptExpand = (deptKey: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(deptKey)) {
        next.delete(deptKey);
      } else {
        next.add(deptKey);
      }
      return next;
    });
  };

  const handleSubmitFlow = () => {
    setFlowError('');
    
    if (!flowForm.departmentId) {
      setFlowError('请选择发放部门');
      return;
    }
    if (!flowForm.recipient.trim()) {
      setFlowError('请输入领取人姓名');
      return;
    }
    if (flowForm.quantity <= 0) {
      setFlowError('发放数量必须大于0');
      return;
    }
    if (!flowForm.autoAssign && flowForm.seals.length !== flowForm.quantity) {
      setFlowError(`请选择 ${flowForm.quantity} 枚印章`);
      return;
    }
    
    try {
      const dept = mockDepartments.find(d => d.id === flowForm.departmentId);
      recordFlow(batch.id, {
        departmentId: flowForm.departmentId,
        departmentName: dept?.name || '',
        quantity: flowForm.quantity,
        flowDate: new Date().toISOString(),
        operator: '孙强',
        seals: flowForm.autoAssign ? [] : flowForm.seals,
        recipient: flowForm.recipient.trim(),
      });
      setShowFlowModal(false);
      setFlowForm({ 
        departmentId: '', 
        quantity: 1, 
        recipient: '', 
        autoAssign: true, 
        seals: [] 
      });
      setFlowError('');
    } catch (err: any) {
      setFlowError(err.message || '发放失败，请重试');
    }
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
            <CardHeader className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <CardTitle>印章清单</CardTitle>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      sealViewMode === 'list'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setSealViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                    列表视图
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      sealViewMode === 'group'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setSealViewMode('group')}
                  >
                    <Layers className="w-4 h-4" />
                    分组视图
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={sealViewMode === 'list' ? 'p-0' : ''}>
              {sealViewMode === 'list' ? (
                <Table
                  data={batch.seals}
                  columns={sealColumns}
                  rowKey={(seal) => seal.id}
                  emptyText="暂无印章数据"
                />
              ) : (
                <div className="space-y-3">
                  {Object.entries(sealsByDepartment).map(([deptKey, group]) => {
                    const isExpanded = expandedDepts.has(deptKey);
                    const isInStock = deptKey === '__in_stock__';
                    const sealCount = group.seals.length;
                    if (sealCount === 0) return null;

                    return (
                      <div
                        key={deptKey}
                        className={`border rounded-xl overflow-hidden transition-all ${
                          isExpanded ? 'border-primary/30' : 'border-gray-200'
                        }`}
                      >
                        <button
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                          onClick={() => toggleDeptExpand(deptKey)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              isInStock ? 'bg-emerald-100' : 'bg-primary/10'
                            }`}>
                              {isInStock ? (
                                <Package className="w-4.5 h-4.5 text-emerald-600" />
                              ) : (
                                <MapPin className="w-4.5 h-4.5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {group.deptName}
                              </div>
                              <div className="text-sm text-gray-500">
                                共 {sealCount} 枚印章
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {!isInStock && group.seals[0]?.currentHolder && (
                              <Badge variant="info" size="sm">
                                领取人：{group.seals[0].currentHolder}
                              </Badge>
                            )}
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-3 bg-white border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-2">
                              {group.seals.map(seal => {
                                const statusConfig = sealStatusConfig[seal.status];
                                return (
                                  <div
                                    key={seal.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    <div>
                                      <div className="font-mono text-sm font-semibold text-gray-800">
                                        {seal.sealCode}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        {seal.receivedDate
                                          ? `领用：${formatDate(seal.receivedDate)}`
                                          : seal.sealName
                                        }
                                      </div>
                                    </div>
                                    <Badge variant={statusConfig.variant} size="sm">
                                      {statusConfig.label}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {Object.values(sealsByDepartment).every(g => g.seals.length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>暂无印章数据</p>
                    </div>
                  )}
                </div>
              )}
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
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
                  领取人
                </label>
                <Input
                  placeholder="请输入领取人姓名"
                  value={flowForm.recipient}
                  onChange={(e) => setFlowForm({ ...flowForm, recipient: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  发放方式
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      flowForm.autoAssign
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setFlowForm({ ...flowForm, autoAssign: true, seals: [] })}
                  >
                    自动分配
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      !flowForm.autoAssign
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setFlowForm({ ...flowForm, autoAssign: false })}
                  >
                    手动选择
                  </button>
                </div>
              </div>
              {flowForm.autoAssign ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    发放数量（剩余 <span className="text-primary font-semibold">{batch.remainingQuantity}</span> 枚）
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={batch.remainingQuantity}
                    value={flowForm.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setFlowForm({ ...flowForm, quantity: val });
                      if (val > batch.remainingQuantity) {
                        setFlowError(`发放数量不能超过剩余库存(${batch.remainingQuantity}枚)`);
                      } else {
                        setFlowError('');
                      }
                    }}
                    error={flowError}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择印章编号（已选 <span className="text-primary font-semibold">{flowForm.seals.length}</span> 枚，剩余 {inStockSeals.length} 枚）
                  </label>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                    {inStockSeals.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {inStockSeals.map(seal => (
                          <label
                            key={seal.id}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
                              flowForm.seals.includes(seal.id)
                                ? 'bg-primary/10 border-primary'
                                : 'bg-white border-gray-200 hover:border-primary/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="rounded text-primary focus:ring-primary"
                              checked={flowForm.seals.includes(seal.id)}
                              onChange={(e) => {
                                const newSeals = e.target.checked
                                  ? [...flowForm.seals, seal.id]
                                  : flowForm.seals.filter(id => id !== seal.id);
                                setFlowForm({
                                  ...flowForm,
                                  seals: newSeals,
                                  quantity: newSeals.length,
                                });
                                if (newSeals.length > batch.remainingQuantity) {
                                  setFlowError(`发放数量不能超过剩余库存(${batch.remainingQuantity}枚)`);
                                } else {
                                  setFlowError('');
                                }
                              }}
                            />
                            <span className="text-sm font-mono text-gray-700">{seal.sealCode}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">暂无可用印章</p>
                    )}
                  </div>
                </div>
              )}
              {flowError && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-rose-600">{flowError}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowFlowModal(false)}>
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitFlow}
                disabled={
                  !flowForm.departmentId ||
                  !flowForm.recipient ||
                  flowForm.quantity <= 0 ||
                  flowForm.quantity > batch.remainingQuantity ||
                  (!flowForm.autoAssign && flowForm.seals.length !== flowForm.quantity) ||
                  !!flowError
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                确认发放 {flowForm.quantity > 0 ? `(${flowForm.quantity}枚)` : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDetail;
