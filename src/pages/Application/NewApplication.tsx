import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Paperclip, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, TextArea, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useApplicationStore } from '../../store/useApplicationStore';
import { useBatchStore } from '../../store/useBatchStore';

const NewApplication: React.FC = () => {
  const navigate = useNavigate();
  const createApplication = useApplicationStore(state => state.createApplication);
  const batches = useBatchStore(state => state.batches);
  
  const activeBatches = useMemo(() => {
    return batches.filter(b => b.status === 'active');
  }, [batches]);

  const [formData, setFormData] = useState({
    reason: '',
    sealId: '',
    sealName: '',
    sealType: '',
    copies: 1,
    urgency: 'normal' as 'normal' | 'urgent' | 'emergency',
  });
  const [attachments, setAttachments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sealOptions = activeBatches.map(batch => ({
    value: batch.id,
    label: `${batch.sealName} (${batch.batchNo})`,
  }));

  const urgencyOptions = [
    { value: 'normal', label: '普通' },
    { value: 'urgent', label: '紧急' },
    { value: 'emergency', label: '特急' },
  ];

  const handleSealChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const batchId = e.target.value;
    const batch = activeBatches.find(b => b.id === batchId);
    setFormData(prev => ({
      ...prev,
      sealId: batchId,
      sealName: batch?.sealName || '',
      sealType: batch?.sealType || '',
    }));
  };

  const handleAddAttachment = () => {
    const fileName = `附件${attachments.length + 1}.pdf`;
    setAttachments([...attachments, fileName]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.reason.trim()) {
      newErrors.reason = '请输入用印事由';
    } else if (formData.reason.length < 10) {
      newErrors.reason = '事由描述至少10个字符';
    }
    if (!formData.sealId) {
      newErrors.sealId = '请选择印章';
    }
    if (formData.copies < 1) {
      newErrors.copies = '份数至少为1';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newApp = createApplication({
      ...formData,
      attachments,
    });

    setIsSubmitting(false);
    navigate(`/applications/${newApp.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>返回列表</span>
      </button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">新建用印申请</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            请填写以下信息提交用印申请，审批通过后可前往行政部用印
          </p>
        </CardHeader>

        {formData.urgency === 'emergency' && (
          <div className="mx-6 -mt-2 mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-700">
              特急申请将缩短审批时限，每个节点仅4小时处理时间
            </p>
          </div>
        )}

        {formData.urgency === 'urgent' && (
          <div className="mx-6 -mt-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              紧急申请审批时限为每个节点12小时
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <TextArea
                  label="用印事由"
                  placeholder="请详细描述用印事由和用途..."
                  rows={4}
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, reason: e.target.value }))
                  }
                  error={errors.reason}
                />
              </div>

              <div>
                <Select
                  label="选择印章"
                  options={[{ value: '', label: '请选择印章' }, ...sealOptions]}
                  value={formData.sealId}
                  onChange={handleSealChange}
                  error={errors.sealId}
                />
              </div>

              <div>
                <Input
                  label="用印份数"
                  type="number"
                  min={1}
                  value={formData.copies}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      copies: parseInt(e.target.value) || 1,
                    }))
                  }
                  error={errors.copies}
                />
              </div>

              <div>
                <Select
                  label="紧急程度"
                  options={urgencyOptions}
                  value={formData.urgency}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      urgency: e.target.value as 'normal' | 'urgent' | 'emergency',
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                附件材料
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
                onClick={handleAddAttachment}
              >
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  点击上传或拖拽文件到此处
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  支持 PDF、Word、Excel 格式，单个文件不超过 10MB
                </p>
              </div>

              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{file}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="font-medium text-primary-800 mb-2">审批流程</h4>
              <div className="flex items-center gap-2 text-sm text-primary-700">
                <Badge variant="info">部门主管审批</Badge>
                <span className="text-gray-400">→</span>
                <Badge variant="info">行政复核</Badge>
                <span className="text-gray-400">→</span>
                <Badge variant="info">印章管理员用印</Badge>
              </div>
              <p className="text-xs text-primary-600 mt-2">
                预计完成时间：{formData.urgency === 'emergency' ? '12小时' : formData.urgency === 'urgent' ? '36小时' : '72小时'}
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '提交申请'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewApplication;
