import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, Hash, FileText, Plus, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select, TextArea } from '../../components/ui/Input';
import { useBatchStore } from '../../store/useBatchStore';
import { generateId } from '../../utils/date';
import type { Seal } from '../../types';

const NewBatch: React.FC = () => {
  const navigate = useNavigate();
  const { createBatch } = useBatchStore();
  const [formData, setFormData] = useState({
    batchNo: '',
    sealType: 'company' as 'company' | 'contract' | 'finance',
    sealName: '公司公章',
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    totalQuantity: 10,
    remark: '',
  });
  const [sealPrefix, setSealPrefix] = useState('GZZ');

  const sealTypeOptions = [
    { value: 'company', label: '公司公章', prefix: 'GZZ' },
    { value: 'contract', label: '合同专用章', prefix: 'HTZ' },
    { value: 'finance', label: '财务专用章', prefix: 'CZY' },
  ];

  const handleSealTypeChange = (value: string) => {
    const option = sealTypeOptions.find(o => o.value === value);
    setFormData({
      ...formData,
      sealType: value as any,
      sealName: option?.label || '',
    });
    setSealPrefix(option?.prefix || 'GZZ');
  };

  const generateSeals = (): Seal[] => {
    const seals: Seal[] = [];
    for (let i = 0; i < formData.totalQuantity; i++) {
      const code = `${sealPrefix}-${String(i + 1).padStart(3, '0')}`;
      seals.push({
        id: `seal-new-${generateId()}-${i}`,
        batchId: '',
        sealCode: code,
        sealName: formData.sealName,
        sealType: formData.sealType,
        status: 'in_stock',
      });
    }
    return seals;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seals = generateSeals();
    createBatch({
      ...formData,
      manufactureDate: new Date(formData.manufactureDate).toISOString(),
      expiryDate: new Date(formData.expiryDate).toISOString(),
      seals,
    });
    navigate('/batches');
  };

  const previewSeals = generateSeals().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/batches')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">新建印章批次</h1>
          <p className="text-gray-500 mt-1">录入新批次印章信息，生成印章编号</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Hash className="w-4 h-4 inline mr-1 text-gray-400" />
                      批次号 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="如：BATCH-GZ-2024-001"
                      value={formData.batchNo}
                      onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      建议格式：BATCH-{sealTypeOptions.find(o => o.value === formData.sealType)?.prefix || 'XX'}-{new Date().getFullYear()}-XXX
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Package className="w-4 h-4 inline mr-1 text-gray-400" />
                      印章类型 <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.sealType}
                      onChange={(e) => handleSealTypeChange(e.target.value)}
                      required
                    >
                      {sealTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1 text-gray-400" />
                      制造日期 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.manufactureDate}
                      onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1 text-gray-400" />
                      有效期至 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Hash className="w-4 h-4 inline mr-1 text-gray-400" />
                      印章数量 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.totalQuantity}
                      onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 1 })}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      将自动生成 {formData.totalQuantity} 个连续编号的印章
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FileText className="w-4 h-4 inline mr-1 text-gray-400" />
                      备注
                    </label>
                    <TextArea
                      placeholder="请输入备注信息（可选）"
                      value={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>印章编号预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {previewSeals.map((seal, index) => (
                    <Badge key={seal.id} variant="info" className="font-mono text-xs py-1.5">
                      {seal.sealCode}
                    </Badge>
                  ))}
                  {formData.totalQuantity > 10 && (
                    <Badge variant="default" className="font-mono text-xs py-1.5">
                      +{formData.totalQuantity - 10} 更多...
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  编号规则：{sealPrefix}-001 至 {sealPrefix}-{String(formData.totalQuantity).padStart(3, '0')}
                </p>
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
                  <span className="text-gray-500">批次号</span>
                  <span className="font-medium font-mono text-sm">
                    {formData.batchNo || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">印章类型</span>
                  <Badge variant="info" size="sm">
                    {formData.sealName}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">制造日期</span>
                  <span className="text-gray-700">{formData.manufactureDate}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">有效期至</span>
                  <span className="text-gray-700">{formData.expiryDate || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">印章数量</span>
                  <span className="text-gray-700">{formData.totalQuantity} 枚</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">编号前缀</span>
                  <span className="font-mono text-gray-700">{sealPrefix}</span>
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
                  disabled={!formData.batchNo || !formData.expiryDate}
                >
                  <Save className="w-4 h-4 mr-2" />
                  创建批次
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/batches')}
                >
                  取消
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewBatch;
