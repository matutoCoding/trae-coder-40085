import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Package, MapPin, User, Calendar, TrendingUp, AlertTriangle, FileText, ArrowRight, ChevronRight, ArrowLeft, RefreshCw, Check, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, TextArea, Select } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { StatusDot } from '../../components/common/StatusDot';
import { Timeline, TimelineItem } from '../../components/ui/Timeline';
import { useBatchStore } from '../../store/useBatchStore';
import { useRecallStore } from '../../store/useRecallStore';
import { formatDate, formatDateTime } from '../../utils/date';
import { batchStatusConfig, sealStatusConfig } from '../../utils/status';
import type { SealBatch, SealFlow, Seal } from '../../types';

const TracePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { batches, getBatchByNo, traceBatchFlow } = useBatchStore();
  const [searchType, setSearchType] = useState<'batch' | 'seal'>('batch');
  const [searchValue, setSearchValue] = useState(searchParams.get('batchNo') || '');
  const [traceResult, setTraceResult] = useState<{
    batch?: SealBatch;
    flows: SealFlow[];
    seals: Seal[];
    targetSeal?: Seal;
  } | null>(null);
  const [searched, setSearched] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [recallMode, setRecallMode] = useState<'single' | 'department' | 'selected'>('single');
  const [selectedSealIds, setSelectedSealIds] = useState<string[]>([]);
  const [recallReason, setRecallReason] = useState('');
  const [recallPriority, setRecallPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const createRecall = useRecallStore(state => state.createRecall);

  useEffect(() => {
    const batchNo = searchParams.get('batchNo');
    if (batchNo) {
      handleSearch(batchNo);
    }
  }, [searchParams]);

  const handleSearch = (value?: string) => {
    const searchTerm = value || searchValue.trim();
    if (!searchTerm) return;

    setSearched(true);
    let foundBatch: SealBatch | undefined;
    let targetSeal: Seal | undefined;

    if (searchType === 'batch') {
      foundBatch = getBatchByNo(searchTerm);
    } else {
      for (const b of batches) {
        const seal = b.seals.find(s => s.sealCode === searchTerm);
        if (seal) {
          foundBatch = b;
          targetSeal = seal;
          break;
        }
      }
    }

    if (foundBatch) {
      const flows = traceBatchFlow(foundBatch.batchNo) || [];
      setTraceResult({
        batch: foundBatch,
        flows,
        seals: foundBatch.seals,
        targetSeal,
      });
      if (searchType === 'batch') {
        setSearchParams({ batchNo: foundBatch.batchNo });
      } else {
        setSearchParams({ batchNo: foundBatch.batchNo, sealCode: searchTerm });
      }
    } else {
      setTraceResult(null);
    }
  };

  const inUseSeals = useMemo(() => {
    return traceResult?.seals.filter(s => s.status === 'in_use') || [];
  }, [traceResult?.seals]);

  const departmentSeals = useMemo(() => {
    if (!traceResult?.targetSeal?.currentDepartment) return [];
    return inUseSeals.filter(s => s.currentDepartment === traceResult.targetSeal?.currentDepartment);
  }, [inUseSeals, traceResult?.targetSeal]);

  const openRecallModal = (mode: 'single' | 'department' | 'selected') => {
    setRecallMode(mode);
    setSelectedSealIds(mode === 'single' && traceResult?.targetSeal ? [traceResult.targetSeal.id] : []);
    setRecallReason('');
    setRecallPriority('medium');
    setShowRecallModal(true);
  };

  const handleRecallSubmit = () => {
    if (!traceResult?.batch) return;

    let sealIdsToRecall: string[] = [];
    if (recallMode === 'single' && traceResult.targetSeal) {
      sealIdsToRecall = [traceResult.targetSeal.id];
    } else if (recallMode === 'department') {
      sealIdsToRecall = departmentSeals.map(s => s.id);
    } else {
      sealIdsToRecall = selectedSealIds;
    }

    if (sealIdsToRecall.length === 0) return;

    const sealCodesByDept: Record<string, string[]> = {};
    const deptIds: string[] = [];
    const deptIdMap: Record<string, string> = {};

    traceResult.flows.forEach(flow => {
      deptIdMap[flow.departmentName] = flow.departmentId;
    });

    sealIdsToRecall.forEach(sealId => {
      const seal = traceResult.seals.find(s => s.id === sealId);
      if (seal && seal.currentDepartment) {
        const deptId = deptIdMap[seal.currentDepartment] || `dept-${seal.currentDepartment}`;
        if (!sealCodesByDept[deptId]) {
          sealCodesByDept[deptId] = [];
          deptIds.push(deptId);
        }
        sealCodesByDept[deptId].push(seal.sealCode);
      }
    });

    const newRecall = createRecall({
      batchId: traceResult.batch.id,
      batchNo: traceResult.batch.batchNo,
      reason: recallReason || '印章质量问题，需召回检查',
      priority: recallPriority,
      departmentIds: deptIds,
      sealCodesByDept,
    });

    setShowRecallModal(false);
    navigate(`/recalls/${newRecall.id}`);
  };

  const mapFlowToTimeline = (flows: SealFlow[]): TimelineItem[] => {
    return flows.map((flow, index) => ({
      id: flow.id || `trace-flow-${index}`,
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
      render: (seal) => {
        const isTarget = traceResult?.targetSeal?.id === seal.id;
        return (
          <span className={`font-mono text-sm ${isTarget ? 'text-primary font-bold bg-primary/10 px-2 py-0.5 rounded' : 'text-gray-800'}`}>
            {seal.sealCode}
          </span>
        );
      },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/batches')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">流向追踪</h1>
          <p className="text-gray-500 mt-1">按批次号或印章编号反查流向，快速定位问题印章</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>反向查询</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  searchType === 'batch'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setSearchType('batch')}
              >
                <Package className="w-4 h-4 inline mr-1.5" />
                按批次号
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  searchType === 'seal'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setSearchType('seal')}
              >
                <FileText className="w-4 h-4 inline mr-1.5" />
                按印章编号
              </button>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder={searchType === 'batch' ? '请输入批次号，如 BATCH-GZ-2024-001' : '请输入印章编号，如 GZZ-001'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                icon={<Search className="w-4 h-4" />}
                className="flex-1"
              />
              <Button variant="primary" onClick={() => handleSearch()}>
                <TrendingUp className="w-4 h-4 mr-2" />
                查询流向
              </Button>
            </div>
          </div>

          {searched && !traceResult && (
            <div className="text-center py-12 mt-4">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">未找到相关记录</p>
              <p className="text-gray-500 text-sm mt-1">
                请检查{searchType === 'batch' ? '批次号' : '印章编号'}是否正确
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {traceResult && traceResult.batch && (
        <>
          {traceResult.targetSeal && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xl font-bold text-gray-900 font-mono">
                      {traceResult.targetSeal.sealCode}
                    </h2>
                    <Badge variant={sealStatusConfig[traceResult.targetSeal.status].variant} size="lg">
                      {sealStatusConfig[traceResult.targetSeal.status].label}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{traceResult.targetSeal.sealName} · 所属批次：{traceResult.batch.batchNo}</p>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <MapPin className="w-4 h-4" />
                        当前部门
                      </div>
                      <div className="font-semibold text-gray-900">
                        {traceResult.targetSeal.currentDepartment || '在库'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <User className="w-4 h-4" />
                        领取人
                      </div>
                      <div className="font-semibold text-gray-900">
                        {traceResult.targetSeal.currentHolder || '-'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        领用日期
                      </div>
                      <div className="font-semibold text-gray-900">
                        {traceResult.targetSeal.receivedDate ? formatDate(traceResult.targetSeal.receivedDate) : '-'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="danger"
                    onClick={() => openRecallModal('single')}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    召回这枚章
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => openRecallModal('department')}
                  >
                    召回同部门全部
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/batches/${traceResult.batch!.id}`)}
                  >
                    查看批次详情
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-gray-900 font-mono">
                    {traceResult.batch.batchNo}
                  </h2>
                  <Badge variant={batchStatusConfig[traceResult.batch.status].variant}>
                    {batchStatusConfig[traceResult.batch.status].label}
                  </Badge>
                </div>
                <p className="text-gray-600">{traceResult.batch.sealName}</p>
              </div>
              {!traceResult.targetSeal && (
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/batches/${traceResult.batch!.id}`)}
                >
                  查看批次详情
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">总印章数</div>
              <div className="text-2xl font-bold text-gray-900">
                {traceResult.batch.totalQuantity} 枚
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">已发放</div>
              <div className="text-2xl font-bold text-blue-600">
                {traceResult.batch.totalQuantity - traceResult.batch.remainingQuantity} 枚
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">涉及部门</div>
              <div className="text-2xl font-bold text-emerald-600">
                {new Set(traceResult.flows.map(f => f.departmentId)).size} 个
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">发放次数</div>
              <div className="text-2xl font-bold text-amber-600">
                {traceResult.flows.length} 次
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>流向时间线</CardTitle>
                </CardHeader>
                <CardContent>
                  {traceResult.flows.length > 0 ? (
                    <Timeline items={mapFlowToTimeline(traceResult.flows)} />
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
                    data={traceResult.seals}
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
                  <CardTitle>涉及部门</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from(new Set(traceResult.flows.map(f => f.departmentId))).map(deptId => {
                      const deptFlows = traceResult.flows.filter(f => f.departmentId === deptId);
                      const totalQty = deptFlows.reduce((sum, f) => sum + f.quantity, 0);
                      const lastFlow = deptFlows[deptFlows.length - 1];
                      return (
                        <div
                          key={deptId}
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="font-medium text-gray-800">
                                {lastFlow.departmentName}
                              </span>
                            </div>
                            <Badge variant="info">{totalQty} 枚</Badge>
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" />
                              <span>联系人：{lastFlow.recipient}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>最近发放：{formatDate(lastFlow.flowDate)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {traceResult.flows.length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        暂无发放记录
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() => navigate(`/recalls/new?batchId=${traceResult.batch!.id}`)}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    发起召回
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600"
                    onClick={() => {
                      navigator.clipboard.writeText(traceResult.batch!.batchNo);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    复制批次号
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {showRecallModal && traceResult?.batch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-rose-500" />
              发起印章召回
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  召回范围
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      recallMode === 'single'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setRecallMode('single')}
                    disabled={!traceResult.targetSeal}
                  >
                    单枚召回
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      recallMode === 'department'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setRecallMode('department')}
                  >
                    同部门全部
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      recallMode === 'selected'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setRecallMode('selected')}
                  >
                    手动选择
                  </button>
                </div>
              </div>

              {recallMode === 'single' && traceResult.targetSeal && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-mono font-semibold text-gray-900">
                        {traceResult.targetSeal.sealCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        {traceResult.targetSeal.sealName} · {traceResult.targetSeal.currentDepartment}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {recallMode === 'department' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {traceResult.targetSeal?.currentDepartment || '该批次发放部门'}
                      </div>
                      <div className="text-sm text-gray-500">
                        共 {departmentSeals.length} 枚在用印章将被召回
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {recallMode === 'selected' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      选择召回印章（已选 {selectedSealIds.length} 枚）
                    </label>
                    <button
                      className="text-sm text-primary hover:underline"
                      onClick={() => {
                        setSelectedSealIds(inUseSeals.map(s => s.id));
                      }}
                    >
                      全选在用
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                    {inUseSeals.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {inUseSeals.map(seal => (
                          <label
                            key={seal.id}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
                              selectedSealIds.includes(seal.id)
                                ? 'bg-primary/10 border-primary'
                                : 'bg-white border-gray-200 hover:border-primary/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="rounded text-primary focus:ring-primary"
                              checked={selectedSealIds.includes(seal.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSealIds([...selectedSealIds, seal.id]);
                                } else {
                                  setSelectedSealIds(selectedSealIds.filter(id => id !== seal.id));
                                }
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-mono text-gray-700 block truncate">
                                {seal.sealCode}
                              </span>
                              <span className="text-xs text-gray-400 block truncate">
                                {seal.currentDepartment}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">暂无在用印章</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  召回优先级
                </label>
                <Select
                  value={recallPriority}
                  onChange={(e) => setRecallPriority(e.target.value as 'high' | 'medium' | 'low')}
                >
                  <option value="high">高优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="low">低优先级</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  召回原因
                </label>
                <TextArea
                  rows={3}
                  placeholder="请描述召回原因..."
                  value={recallReason}
                  onChange={(e) => setRecallReason(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-blue-700">
                  召回通知将按部门分别发送，通知中会包含具体印章编号清单。
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowRecallModal(false)}>
                取消
              </Button>
              <Button
                variant="danger"
                onClick={handleRecallSubmit}
                disabled={
                  (recallMode === 'single' && !traceResult.targetSeal) ||
                  (recallMode === 'department' && departmentSeals.length === 0) ||
                  (recallMode === 'selected' && selectedSealIds.length === 0)
                }
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                确认召回
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TracePage;
