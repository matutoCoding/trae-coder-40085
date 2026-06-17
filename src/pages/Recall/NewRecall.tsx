import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Package, User, MapPin, FileText, Save, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select, TextArea } from '../../components/ui/Input';
import { useBatchStore } from '../../store/useBatchStore';
import { useRecallStore } from '../../store/useRecallStore';
import { mockDepartments } from '../../mock/data/users';
import type { SealBatch } from '../../types';

const NewRecall: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { batches, getBatch } = useBatchStore();
  const { createRecall } = useRecallStore();
  const [formData, setFormData] = useState({
    batchId: searchParams.get('batchId') || '',
    reason: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    departmentIds: [] as string[],
  });
  const [selectedBatch, setSelectedBatch] = useState<SealBatch | null>(null);

  useEffect(() => {
    if (formData.batchId) {
      const batch = getBatch(formData.batchId);
      setSelectedBatch(batch || null);
      if (batch && batch.flows.length > 0) {
        const deptIds = Array.from(new Set(batch.flows.map(f => f.departmentId)));
        setFormData(prev => ({ ...prev, departmentIds: deptIds }));
      }
    }
  }, [formData.batchId, getBatch]);

  const activeBatches = batches.filter(b => b.status === 'active' && b.flows.length > 0);

  const handleBatchChange = (batchId: string) => {
    setFormData(prev => ({ ...prev, batchId }));
  };

  const toggleDepartment = (deptId: string) => {
    setFormData(prev => ({
      ...prev,
      departmentIds: prev.departmentIds.includes(deptId)
        ? prev.departmentIds.filter(id => id !== deptId)
        : [...prev.departmentIds, deptId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchId || !formData.reason || formData.departmentIds.length === 0) return;
    
    const batch = getBatch(formData.batchId);
    if (!batch) return;

    createRecall({
      batchId: formData.batchId,
      batchNo: batch.batchNo,
      reason: formData.reason,
      priority: formData.priority,
      departmentIds: formData.departmentIds,
    });

    navigate('/recalls');
  };

  const sealTypeNames: Record<string, string> = {
    company: '公司公章',
    contract: '合同专用章',
    finance: '财务专用章',
  };

  const priorityOptions = [
    { value: 'high', label: '高优先级 - 立即处理', color: 'danger' },
    { value: 'medium', label: '中优先级 - 尽快处理', color: 'warning' },
    { value: 'low', label: '低优先级 - 常规处理', color: 'info' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/recalls')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">发起印章召回</h1>
          <p className="text-gray-500 mt-1">选择问题批次，填写召回原因，通知相关部门</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>选择召回批次</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Package className="w-4 h-4 inline mr-1 text-gray-400" />
                    召回批次 <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.batchId}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    required
                  >
                    <option value="">请选择需要召回的批次</option>
                    {activeBatches.map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchNo} - {batch.sealName} (已发放 {batch.totalQuantity - batch.remainingQuantity}/{batch.totalQuantity} 枚)
                      </option>
                    ))}
                  </Select>
                  {activeBatches.length === 0 && (
                    <p className="text-amber-600 text-sm mt-2">
                      暂无可召回的批次（需已发放过印章的有效批次）
                    </p>
                  )}
                </div>

                {selectedBatch && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-mono text-sm text-primary font-medium">
                          {selectedBatch.batchNo}
                        </div>
                        <div className="text-gray-700 mt-1">{selectedBatch.sealName}</div>
                      </div>
                      <Badge variant="info">{sealTypeNames[selectedBatch.sealType]}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">总数量</div>
                        <div className="font-medium text-gray-800">{selectedBatch.totalQuantity} 枚</div>
                      </div>
                      <div>
                        <div className="text-gray-500">已发放</div>
                        <div className="font-medium text-gray-800">
                          {selectedBatch.totalQuantity - selectedBatch.remainingQuantity} 枚
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">涉及部门</div>
                        <div className="font-medium text-gray-800">
                          {new Set(selectedBatch.flows.map(f => f.departmentId)).size} 个
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>召回信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <AlertTriangle className="w-4 h-4 inline mr-1 text-gray-400" />
                    优先级 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    {priorityOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`flex-1 p-3 rounded-lg border-2 transition-all text-left ${
                          formData.priority === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, priority: option.value as any }))}
                      >
                        <div className="font-medium text-gray-800">{option.label.split(' - ')[0]}</div>
                        <div className="text-xs text-gray-500">{option.label.split(' - ')[1]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-4 h-4 inline mr-1 text-gray-400" />
                    召回原因 <span className="text-red-500">*</span>
                  </label>
                  <TextArea
                    placeholder="请详细描述召回原因，包括问题描述、影响范围、处理要求等..."
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={6}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  通知部门
                  <span className="text-gray-400 text-sm font-normal ml-2">
                    （已选择 {formData.departmentIds.length} 个部门）
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBatch ? (
                  <div className="space-y-3">
                    {Array.from(new Set(selectedBatch.flows.map(f => f.departmentId))).map(deptId => {
                      const dept = mockDepartments.find(d => d.id === deptId);
                      const deptFlows = selectedBatch.flows.filter(f => f.departmentId === deptId);
                      const totalQty = deptFlows.reduce((sum, f) => sum + f.quantity, 0);
                      const lastFlow = deptFlows[deptFlows.length - 1];
                      const isSelected = formData.departmentIds.includes(deptId);
                      
                      return (
                        <div
                          key={deptId}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleDepartment(deptId)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-gray-800 flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  {dept?.name || lastFlow.departmentName}
                                </div>
                                <Badge variant="info">{totalQty} 枚</Badge>
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5" />
                                  联系人：{lastFlow.recipient}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5" />
                                  部门负责人：{dept?.manager}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>请先选择召回批次</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>信息汇总</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">召回批次</span>
                  <span className="font-medium font-mono text-sm">
                    {selectedBatch?.batchNo || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">优先级</span>
                  <Badge
                    variant={
                      formData.priority === 'high' ? 'danger' :
                      formData.priority === 'medium' ? 'warning' : 'info'
                    }
                    size="sm"
                  >
                    {priorityOptions.find(o => o.value === formData.priority)?.label.split(' - ')[0]}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">通知部门</span>
                  <span className="text-gray-700">{formData.departmentIds.length} 个</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">发起人</span>
                  <span className="text-gray-700">孙强</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={!formData.batchId || !formData.reason || formData.departmentIds.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  发起召回
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/recalls')}
                >
                  取消
                </Button>
              </CardContent>
            </Card>

            {formData.priority === 'high' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800">高优先级提醒</div>
                    <div className="text-sm text-red-600 mt-1">
                      高优先级召回将立即发送短信通知所有相关部门负责人，请谨慎使用。
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewRecall;
