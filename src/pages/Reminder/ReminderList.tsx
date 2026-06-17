import React, { useState, useMemo } from 'react';
import { Clock, AlertTriangle, TrendingUp, User, Search, Filter, ChevronRight, Bell, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { StatusDot } from '../../components/common/StatusDot';
import { StatCard } from '../../components/common/StatCard';
import { useApplicationStore } from '../../store/useApplicationStore';
import { useDashboardStore } from '../../store/useDashboardStore';
import { formatDateTime, formatRemainingTime, getOverdueHours } from '../../utils/date';
import { nodeStatusConfig, urgencyConfig } from '../../utils/status';
import type { ApprovalNode, SealApplication, OverdueStat } from '../../types';

interface OverdueNodeInfo {
  node: ApprovalNode;
  application: SealApplication;
}

const ReminderList: React.FC = () => {
  const navigate = useNavigate();
  const { applications, sendReminder, updateOverdueStatus } = useApplicationStore();
  const { stats: dashboardStats } = useDashboardStore();
  const topOverduePersons = dashboardStats.topOverduePersons;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'escalated'>('all');
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'normal' | 'urgent' | 'emergency'>('all');

  const overdueNodes = useMemo((): OverdueNodeInfo[] => {
    const result: OverdueNodeInfo[] = [];
    applications.forEach(app => {
      app.approvalNodes.forEach(node => {
        if (node.status === 'pending') {
          if (filterType === 'all' ||
              (filterType === 'overdue' && node.isOverdue) ||
              (filterType === 'escalated' && node.isEscalated)) {
            if (filterUrgency === 'all' || app.urgency === filterUrgency) {
              if (searchTerm === '' ||
                  app.reason.includes(searchTerm) ||
                  app.applicantName.includes(searchTerm) ||
                  node.approverName.includes(searchTerm)) {
                result.push({ node, application: app });
              }
            }
          }
        }
      });
    });
    return result.sort((a, b) => b.node.overdueHours - a.node.overdueHours);
  }, [applications, searchTerm, filterType, filterUrgency]);

  const stats = useMemo(() => {
    const total = overdueNodes.length;
    const overdue = overdueNodes.filter(n => n.node.isOverdue).length;
    const escalated = overdueNodes.filter(n => n.node.isEscalated).length;
    const totalOverdueHours = overdueNodes.reduce((sum, n) => sum + n.node.overdueHours, 0);
    return { total, overdue, escalated, totalOverdueHours };
  }, [overdueNodes]);

  const handleSendReminder = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sendReminder(nodeId, 'normal');
  };

  const handleEscalate = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sendReminder(nodeId, 'escalation', 'u012');
  };

  const columns: Column<OverdueNodeInfo>[] = [
    {
      key: 'application',
      title: '申请信息',
      width: '280px',
      render: (item) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 truncate max-w-[250px]">
            {item.application.reason}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-3.5 h-3.5" />
            <span>{item.application.applicantName}</span>
            <span>·</span>
            <span>{item.application.department}</span>
          </div>
          <Badge variant={urgencyConfig[item.application.urgency].variant} size="sm">
            {urgencyConfig[item.application.urgency].label}
          </Badge>
        </div>
      ),
    },
    {
      key: 'node',
      title: '当前节点',
      width: '180px',
      render: (item) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-800">{item.node.nodeName}</div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-3.5 h-3.5" />
            <span>{item.node.approverName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot status={item.node.isOverdue ? 'warning' : 'info'} pulse={item.node.isOverdue} />
            <span className={`text-sm ${item.node.isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
              {nodeStatusConfig[item.node.status].label}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'deadline',
      title: '超时情况',
      width: '180px',
      render: (item) => (
        <div className="space-y-1">
          {item.node.isOverdue ? (
            <>
              <div className="flex items-center gap-1.5 text-red-600 font-medium">
                <AlertTriangle className="w-4 h-4" />
                <span>已超时 {item.node.overdueHours.toFixed(1)} 小时</span>
              </div>
              <div className="text-sm text-gray-500">
                截止：{formatDateTime(item.node.deadline)}
              </div>
              {item.node.isEscalated && (
                <Badge variant="danger" size="sm">已升级</Badge>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                <Clock className="w-4 h-4" />
                <span>剩余 {formatRemainingTime(item.node.deadline)}</span>
              </div>
              <div className="text-sm text-gray-500">
                截止：{formatDateTime(item.node.deadline)}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'reminders',
      title: '催办记录',
      width: '120px',
      render: (item) => (
        <div className="text-center">
          <div className="font-semibold text-lg text-gray-800">
            {item.node.reminders.length}
          </div>
          <div className="text-xs text-gray-500">次催办</div>
          {item.node.reminders.some(r => r.type === 'escalation') && (
            <Badge variant="danger" size="sm" className="mt-1">
              已升级
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: '220px',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => handleSendReminder(item.node.id, e)}
          >
            <Bell className="w-3.5 h-3.5 mr-1" />
            催办
          </Button>
          {item.node.isOverdue && item.node.overdueHours >= 24 && (
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => handleEscalate(item.node.id, e)}
            >
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              升级
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/applications/${item.application.id}`)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">超时催办管理</h1>
          <p className="text-gray-500 mt-1">监控审批节点超时状态，自动催办和升级处理</p>
        </div>
        <Button variant="primary" onClick={updateOverdueStatus}>
          <Clock className="w-4 h-4 mr-2" />
          刷新超时状态
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="待处理节点"
          value={stats.total}
          icon={<Clock className="w-5 h-5" />}
          variant="info"
        />
        <StatCard
          title="已超时节点"
          value={stats.overdue}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="已升级处理"
          value={stats.escalated}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="danger"
        />
        <StatCard
          title="累计超时时长"
          value={`${stats.totalOverdueHours.toFixed(1)}h`}
          icon={<Clock className="w-5 h-5" />}
          variant="info"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>节点筛选</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="搜索事由、申请人、审批人..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                  >
                    <option value="all">全部节点</option>
                    <option value="overdue">仅超时</option>
                    <option value="escalated">仅已升级</option>
                  </select>
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value as typeof filterUrgency)}
                  >
                    <option value="all">全部紧急度</option>
                    <option value="normal">普通</option>
                    <option value="urgent">紧急</option>
                    <option value="emergency">特急</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>审批节点列表</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table
                data={overdueNodes}
                columns={columns}
                rowKey={(item) => item.node.id}
                emptyText="暂无待处理节点"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>卡点人员排行</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topOverduePersons.slice(0, 5).map((person, index) => (
                  <div key={person.userId} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-red-100 text-red-600' :
                      index === 1 ? 'bg-orange-100 text-orange-600' :
                      index === 2 ? 'bg-amber-100 text-amber-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {person.userName}
                      </div>
                      <div className="text-xs text-gray-500">{person.department}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">{person.overdueCount}次</div>
                      <div className="text-xs text-gray-500">平均{person.avgOverdueHours.toFixed(1)}h</div>
                    </div>
                  </div>
                ))}
                {topOverduePersons.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    暂无卡点记录
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>自动催办规则</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">一级催办</div>
                    <div className="text-sm text-gray-500">超时24小时，发送系统通知给审批人</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">二级催办</div>
                    <div className="text-sm text-gray-500">超时48小时，发送短信提醒审批人</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">自动升级</div>
                    <div className="text-sm text-gray-500">超时72小时，自动升级至上级领导处理</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReminderList;
