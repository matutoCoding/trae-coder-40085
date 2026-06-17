import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, User, Calendar, Package, MapPin, Check, Clock, MessageSquare, Send, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';
import { Progress } from '../../components/ui/Progress';
import { StatusDot } from '../../components/common/StatusDot';
import { Timeline, TimelineItem } from '../../components/ui/Timeline';
import { useRecallStore } from '../../store/useRecallStore';
import { useBatchStore } from '../../store/useBatchStore';
import { formatDate, formatDateTime } from '../../utils/date';
import { recallStatusConfig, priorityConfig, noticeStatusConfig } from '../../utils/status';
import type { RecallNotice } from '../../types';

const RecallDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecall, updateNoticeStatus, updateRecallStatus } = useRecallStore();
  const { getBatch } = useBatchStore();
  const [selectedNotice, setSelectedNotice] = useState<RecallNotice | null>(null);
  const [confirmForm, setConfirmForm] = useState({
    confirmedQuantity: 0,
    remark: '',
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const recall = getRecall(id || '');

  if (!recall) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">召回记录不存在</p>
        <Button variant="primary" onClick={() => navigate('/recalls')}>
          返回列表
        </Button>
      </div>
    );
  }

  const batch = getBatch(recall.batchId);
  const progress = recall.notices.length > 0
    ? (recall.notices.filter(n => n.status === 'confirmed').length / recall.notices.length) * 100
    : 0;
  const confirmed = recall.notices.filter(n => n.status === 'confirmed').length;

  const handleConfirmRecall = () => {
    if (!selectedNotice) return;
    updateNoticeStatus(
      recall.id,
      selectedNotice.id,
      'confirmed',
      confirmForm.confirmedQuantity,
      confirmForm.remark
    );
    setShowConfirmModal(false);
    setSelectedNotice(null);
    setConfirmForm({ confirmedQuantity: 0, remark: '' });
  };

  const handleMarkAsRead = (notice: RecallNotice) => {
    if (notice.status === 'sent') {
      updateNoticeStatus(recall.id, notice.id, 'read');
    }
  };

  const handleCompleteRecall = () => {
    if (confirmed === recall.notices.length) {
      updateRecallStatus(recall.id, 'completed');
    }
  };

  const getTotalQuantity = () => {
    if (!batch) return 0;
    return batch.flows.reduce((sum, f) => sum + f.quantity, 0);
  };

  const getDepartmentQuantity = (deptId: string) => {
    if (!batch) return 0;
    return batch.flows.filter(f => f.departmentId === deptId).reduce((sum, f) => sum + f.quantity, 0);
  };

  const mapNoticesToTimeline = (): TimelineItem[] => {
    return recall.notices.map((notice) => ({
      id: notice.id,
      status: notice.status === 'confirmed' ? 'completed' : notice.status === 'read' ? 'current' : 'pending',
      title: notice.departmentName,
      subtitle: notice.status === 'confirmed'
        ? `已确认回收 ${notice.confirmedQuantity || 0} 枚`
        : notice.status === 'read'
        ? '已阅读通知'
        : '待确认',
      time: formatDateTime(notice.sentAt),
      description: `联系人：${notice.contactPerson || '-'}${notice.remark ? `，备注：${notice.remark}` : ''}`,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/recalls')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-serif">召回详情</h1>
          <p className="text-gray-500 mt-1 font-mono">{recall.batchNo}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={priorityConfig[recall.priority].variant} size="lg">
            {priorityConfig[recall.priority].label}
          </Badge>
          <Badge variant={recallStatusConfig[recall.status].variant} size="lg">
            {recallStatusConfig[recall.status].label}
          </Badge>
        </div>
      </div>

      {recall.priority === 'high' && recall.status !== 'completed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <div className="font-medium text-red-800">高优先级召回</div>
              <div className="text-sm text-red-600">
                请立即跟进处理，确保问题印章全部回收
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">召回进度</div>
          <div className="text-2xl font-bold text-gray-900">{progress.toFixed(0)}%</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">已确认</div>
          <div className="text-2xl font-bold text-green-600">{confirmed}/{recall.notices.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">应回收总数</div>
          <div className="text-2xl font-bold text-blue-600">{getTotalQuantity()} 枚</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">发起时间</div>
          <div className="text-2xl font-bold text-gray-900">{formatDate(recall.createdAt)}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>召回原因</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{recall.reason}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">发起人</div>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-800">{recall.initiatedByName}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">发起时间</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-800">{formatDateTime(recall.createdAt)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">批次状态</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Package className="w-4 h-4 text-gray-400" />
                    <Badge variant={batch ? recallStatusConfig[batch.status].variant : 'default'}>
                      {batch ? recallStatusConfig[batch.status].label : '未知'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                召回进度
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {confirmed}/{recall.notices.length} 部门已确认
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress
                value={progress}
                variant={progress === 100 ? 'success' : progress > 50 ? 'default' : 'warning'}
                className="mb-6"
              />
              <Timeline items={mapNoticesToTimeline()} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>部门确认详情</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {recall.notices.map((notice) => {
                  const deptQty = getDepartmentQuantity(notice.departmentId);
                  const config = noticeStatusConfig[notice.status];
                  return (
                    <div
                      key={notice.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleMarkAsRead(notice)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor}`}>
                            <MapPin className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{notice.departmentName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <User className="w-3.5 h-3.5" />
                              <span>联系人：{notice.contactPerson || '-'}</span>
                              <span>·</span>
                              <span>应回收：{deptQty} 枚</span>
                              {notice.confirmedQuantity !== undefined && (
                                <>
                                  <span>·</span>
                                  <span>已回收：{notice.confirmedQuantity} 枚</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={config.variant}>
                            {config.label}
                          </Badge>
                          {notice.status !== 'confirmed' && recall.status !== 'completed' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNotice(notice);
                                setConfirmForm({ confirmedQuantity: deptQty, remark: '' });
                                setShowConfirmModal(true);
                              }}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              确认
                            </Button>
                          )}
                        </div>
                      </div>
                      {notice.remark && (
                        <div className="mt-2 ml-13 pl-13 text-sm text-gray-500 bg-gray-50 rounded p-2">
                          <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                          备注：{notice.remark}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>批次信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {batch && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">批次号</span>
                    <span className="font-mono text-sm text-gray-800">{batch.batchNo}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">印章名称</span>
                    <span className="text-gray-800">{batch.sealName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">总数量</span>
                    <span className="text-gray-800">{batch.totalQuantity} 枚</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">已发放</span>
                    <span className="text-gray-800">{batch.totalQuantity - batch.remainingQuantity} 枚</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">有效期至</span>
                    <span className="text-gray-800">{formatDate(batch.expiryDate)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>通知统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">待读</span>
                  </div>
                  <Badge variant="default">
                    {recall.notices.filter(n => n.status === 'sent').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span className="text-gray-600">已读</span>
                  </div>
                  <Badge variant="warning">
                    {recall.notices.filter(n => n.status === 'read').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-600">已确认</span>
                  </div>
                  <Badge variant="success">
                    {recall.notices.filter(n => n.status === 'confirmed').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-gray-600">已拒绝</span>
                  </div>
                  <Badge variant="danger">
                    {recall.notices.filter(n => n.status === 'rejected').length}
                  </Badge>
                </div>
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
                onClick={() => navigate(`/trace?batchNo=${recall.batchNo}`)}
              >
                <Package className="w-4 h-4 mr-2" />
                查看批次流向
              </Button>
              {confirmed === recall.notices.length && recall.status !== 'completed' && (
                <Button
                  variant="success"
                  className="w-full justify-start"
                  onClick={handleCompleteRecall}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  标记为已完成
                </Button>
              )}
              {recall.status !== 'completed' && recall.status !== 'cancelled' && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600"
                  onClick={() => updateRecallStatus(recall.id, 'cancelled')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  取消召回
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showConfirmModal && selectedNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">确认回收</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-800">{selectedNotice.departmentName}</div>
              <div className="text-sm text-gray-500 mt-1">
                联系人：{selectedNotice.contactPerson || '-'}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  实际回收数量
                </label>
                <Input
                  type="number"
                  min={0}
                  value={confirmForm.confirmedQuantity}
                  onChange={(e) => setConfirmForm({ ...confirmForm, confirmedQuantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <TextArea
                  placeholder="请输入备注信息（可选）"
                  value={confirmForm.remark}
                  onChange={(e) => setConfirmForm({ ...confirmForm, remark: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={handleConfirmRecall}>
                <Check className="w-4 h-4 mr-2" />
                确认回收
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecallDetail;
