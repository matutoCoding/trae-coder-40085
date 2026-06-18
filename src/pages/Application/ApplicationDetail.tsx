import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Clock,
  Paperclip,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TextArea } from '../../components/ui/Input';
import { Timeline, mapApprovalNodesToTimeline } from '../../components/ui/Timeline';
import { useApplicationStore } from '../../store/useApplicationStore';
import { useOverdueRuleStore } from '../../store/useOverdueRuleStore';
import { formatDateTime, formatRemainingTime } from '../../utils/date';
import {
  applicationStatusConfig,
  nodeStatusConfig,
  urgencyConfig,
} from '../../utils/status';
import type { ApprovalNode } from '../../types';

const ApplicationDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const getApplication = useApplicationStore(state => state.getApplication);
  const approveNode = useApplicationStore(state => state.approveNode);
  const rejectNode = useApplicationStore(state => state.rejectNode);
  const sendReminder = useApplicationStore(state => state.sendReminder);

  const application = getApplication(id || '');
  const getRuleByUrgency = useOverdueRuleStore(state => state.getRuleByUrgency);
  const [comment, setComment] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">申请不存在或已被删除</p>
        <Button className="mt-4" onClick={() => navigate('/applications')}>
          返回列表
        </Button>
      </div>
    );
  }

  const currentNode = application.approvalNodes[application.currentNodeIndex];
  const isOverdue = currentNode?.isOverdue;
  const timelineItems = mapApprovalNodesToTimeline(
    application.approvalNodes,
    application.currentNodeIndex
  );

  const handleApprove = async () => {
    if (!currentNode) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    approveNode(application.id, currentNode.id, comment);
    setIsProcessing(false);
    setShowApproveModal(false);
    setComment('');
  };

  const handleReject = async () => {
    if (!currentNode || !comment.trim()) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    rejectNode(application.id, currentNode.id, comment);
    setIsProcessing(false);
    setShowRejectModal(false);
    setComment('');
  };

  const handleSendReminder = () => {
    if (!currentNode) return;
    sendReminder(currentNode.id, 'normal');
  };

  const handleEscalate = () => {
    if (!currentNode) return;
    sendReminder(currentNode.id, 'escalation', 'u012');
  };

  const statusConfig = applicationStatusConfig[application.status];
  const urgency = urgencyConfig[application.urgency];

  return (
    <div className="animate-fade-in-up">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>返回列表</span>
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">用印申请详情</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    申请编号：{application.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      application.urgency === 'emergency'
                        ? 'danger'
                        : application.urgency === 'urgent'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {urgency.label}
                  </Badge>
                  <Badge
                    variant={
                      application.status === 'approved' || application.status === 'completed'
                        ? 'success'
                        : application.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">用印事由</h4>
                <p className="text-gray-900 leading-relaxed">{application.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">申请人</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {application.applicantName}
                      </p>
                      <p className="text-sm text-gray-500">{application.department}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">申请时间</h4>
                  <p className="text-gray-900">
                    {formatDateTime(application.createdAt)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">印章类型</h4>
                  <p className="text-gray-900 font-medium">{application.sealName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">用印份数</h4>
                  <p className="text-gray-900 font-medium">{application.copies} 份</p>
                </div>
              </div>

              {application.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">附件材料</h4>
                  <div className="space-y-2">
                    {application.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-500" />
                审批轨迹
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline items={timelineItems} />
            </CardContent>
          </Card>

          {currentNode?.reminders && currentNode.reminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-500" />
                  催办记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentNode.reminders.map((reminder, index) => (
                    <div
                      key={reminder.id}
                      className={`p-3 rounded-lg border ${
                        reminder.type === 'escalation'
                          ? 'bg-rose-50 border-rose-200'
                          : 'bg-amber-50 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={reminder.type === 'escalation' ? 'danger' : 'warning'}
                        >
                          {reminder.type === 'escalation' ? '升级通知' : '催办通知'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(reminder.sentAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{reminder.content}</p>
                      {reminder.escalatedToName && (
                        <p className="text-xs text-rose-600 mt-1">
                          已升级至：{reminder.escalatedToName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {application.status === 'pending' && currentNode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">当前审批节点</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`p-4 rounded-lg border-2 ${
                    currentNode.status === 'escalated'
                      ? 'border-rose-300 bg-rose-50'
                      : isOverdue
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-primary-200 bg-primary-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {currentNode.nodeName}
                    </span>
                    <div className="flex items-center gap-2">
                      {currentNode.status === 'escalated' && (
                        <Badge variant="danger">已升级</Badge>
                      )}
                      {isOverdue && currentNode.status !== 'escalated' && (
                        <Badge variant="warning">已超时</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    审批人：{currentNode.approverName}
                  </p>
                  {currentNode.status === 'escalated' && currentNode.escalatedToName && (
                    <p className="text-sm text-rose-600 mb-2 font-medium flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      已升级至：{currentNode.escalatedToName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    {currentNode.status === 'escalated' ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-rose-500" />
                        <span className="text-rose-600 font-medium">
                          升级时间：{currentNode.escalatedAt ? formatDateTime(currentNode.escalatedAt) : '-'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className={`h-4 w-4 ${isOverdue ? 'text-amber-500' : 'text-gray-400'}`} />
                        <span className={isOverdue ? 'text-amber-600 font-medium' : 'text-gray-600'}>
                          {formatRemainingTime(currentNode.deadline)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" onClick={() => setShowApproveModal(true)}>
                    <Check className="h-4 w-4 mr-2" />
                    同意
                  </Button>
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => setShowRejectModal(true)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    驳回
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleSendReminder}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    发送催办
                  </Button>
                  {isOverdue && currentNode.overdueHours >= 48 && (
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={handleEscalate}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      升级至上级
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">节点信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.approvalNodes.map((node: ApprovalNode, index: number) => {
                const nodeConfig = nodeStatusConfig[node.status];
                const isCurrent = index === application.currentNodeIndex && application.status === 'pending';

                return (
                  <div
                    key={node.id}
                    className={`p-3 rounded-lg border ${
                      isCurrent
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {node.nodeName}
                      </span>
                      <Badge
                        variant={
                          node.status === 'approved'
                            ? 'success'
                            : node.status === 'rejected'
                            ? 'danger'
                            : node.status === 'escalated'
                            ? 'danger'
                            : node.isOverdue
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {node.status === 'escalated'
                          ? '已升级'
                          : node.isOverdue
                          ? '已超时'
                          : nodeConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{node.approverName}</p>
                    {node.approvedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateTime(node.approvedAt)}
                      </p>
                    )}
                    {node.escalatedAt && node.status === 'escalated' && (
                      <div className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        升级时间：{formatDateTime(node.escalatedAt)}
                      </div>
                    )}
                    {node.comment && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        备注：{node.comment}
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                当前套用规则
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">紧急程度</span>
                <Badge variant={urgencyConfig[application.urgency].variant} size="sm">
                  {urgencyConfig[application.urgency].label}
                </Badge>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">一级催办</span>
                  <span className="text-gray-900 font-medium">
                    {getRuleByUrgency(application.urgency).firstReminderHours}小时后
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">二级催办</span>
                  <span className="text-gray-900 font-medium">
                    {getRuleByUrgency(application.urgency).secondReminderHours}小时后
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">自动升级</span>
                  <span className="text-gray-900 font-medium">
                    {getRuleByUrgency(application.urgency).escalationHours}小时后
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">升级对象</span>
                  <span className="text-gray-900 font-medium">
                    {getRuleByUrgency(application.urgency).escalationRoleName}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * 规则可在"规则配置"页面调整
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-4">确认同意</h3>
            <TextArea
              label="审批意见（可选）"
              placeholder="请输入审批意见..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowApproveModal(false)}>
                取消
              </Button>
              <Button onClick={handleApprove} disabled={isProcessing}>
                {isProcessing ? '处理中...' : '确认同意'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-4">驳回申请</h3>
            <TextArea
              label="驳回原因"
              placeholder="请输入驳回原因..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {!comment.trim() && (
              <p className="text-xs text-rose-500 mt-1">请填写驳回原因</p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowRejectModal(false)}>
                取消
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={isProcessing || !comment.trim()}
              >
                {isProcessing ? '处理中...' : '确认驳回'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;
