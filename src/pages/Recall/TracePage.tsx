import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Package, MapPin, User, Calendar, TrendingUp, AlertTriangle, FileText, ArrowRight, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { StatusDot } from '../../components/common/StatusDot';
import { Timeline, TimelineItem } from '../../components/ui/Timeline';
import { useBatchStore } from '../../store/useBatchStore';
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
  } | null>(null);
  const [searched, setSearched] = useState(false);

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

    if (searchType === 'batch') {
      foundBatch = getBatchByNo(searchTerm);
    } else {
      foundBatch = batches.find(b => b.seals.some(s => s.sealCode === searchTerm));
    }

    if (foundBatch) {
      const flows = traceBatchFlow(foundBatch.batchNo) || [];
      setTraceResult({
        batch: foundBatch,
        flows,
        seals: foundBatch.seals,
      });
      setSearchParams({ batchNo: foundBatch.batchNo });
    } else {
      setTraceResult(null);
    }
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
      key: 'location',
      title: '当前位置',
      render: (seal) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-600">
            {seal.currentDepartment || seal.currentHolder || '在库'}
          </span>
        </div>
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
              <Button
                variant="secondary"
                onClick={() => navigate(`/batches/${traceResult.batch!.id}`)}
              >
                查看批次详情
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
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
    </div>
  );
};

export default TracePage;
