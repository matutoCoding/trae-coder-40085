import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Package,
  RefreshCw,
  TrendingUp,
  Clock,
  User,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useApplicationStore } from '../../store/useApplicationStore';
import { useBatchStore } from '../../store/useBatchStore';
import { useRecallStore } from '../../store/useRecallStore';
import { formatDateTime, getDaysUntilExpiry } from '../../utils/date';
import { applicationStatusConfig, urgencyConfig } from '../../utils/status';

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const COLORS = ['#1e3a5f', '#3a6df0', '#7ba0ff', '#b9d0ff', '#e0eaff'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats } = useDashboardStore();
  const applications = useApplicationStore(state => state.applications);
  const batches = useBatchStore(state => state.batches);
  const recalls = useRecallStore(state => state.recalls);
  
  const expiringBatches = useMemo(() => {
    return batches.filter(b => 
      b.status === 'active' && getDaysUntilExpiry(b.expiryDate) <= 30
    );
  }, [batches]);
  
  const ongoingRecalls = useMemo(() => {
    return recalls.filter(
      r => r.status === 'in_progress' || r.status === 'pending'
    );
  }, [recalls]);

  const monthlyData = stats.monthlyApplications.map((count, index) => ({
    month: MONTHS[index],
    count,
  }));

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="待办审批"
          value={stats.pendingApplications}
          icon={<FileText className="h-6 w-6" />}
          color="primary"
          trend={{ value: 12, isPositive: true }}
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="超时任务"
          value={stats.overdueTasks}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="warning"
          trend={{ value: 5, isPositive: false }}
          onClick={() => navigate('/reminders')}
        />
        <StatCard
          title="有效批次"
          value={stats.activeBatches}
          icon={<Package className="h-6 w-6" />}
          color="success"
          onClick={() => navigate('/batches')}
        />
        <StatCard
          title="进行中召回"
          value={stats.ongoingRecalls}
          icon={<RefreshCw className="h-6 w-6" />}
          color="danger"
          onClick={() => navigate('/recalls')}
        />
      </div>

      {expiringBatches.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-medium text-amber-800">
                有 {expiringBatches.length} 个批次即将在30天内过期
              </p>
              <p className="text-sm text-amber-600">
                {expiringBatches.map(b => b.batchNo).join('、')}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/batches')}>
            查看详情
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>用印申请趋势</span>
              <Badge variant="info">近12个月</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1e3a5f"
                    strokeWidth={3}
                    dot={{ fill: '#1e3a5f', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>部门申请分布</span>
              <Badge variant="info">本年度</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.departmentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {stats.departmentStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {stats.departmentStats.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>最近申请</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/applications')}
              >
                查看全部
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentApplications.map(app => {
                const statusConfig = applicationStatusConfig[app.status];
                const urgency = urgencyConfig[app.urgency];
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/applications/${app.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-md">
                          {app.reason.substring(0, 30)}...
                        </p>
                        <p className="text-sm text-gray-500">
                          {app.applicantName} · {app.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={app.urgency === 'emergency' ? 'danger' : app.urgency === 'urgent' ? 'warning' : 'default'}>
                        {urgency.label}
                      </Badge>
                      <Badge
                        className={statusConfig.bgColor}
                        variant={app.status === 'approved' || app.status === 'completed' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}
                      >
                        {statusConfig.label}
                      </Badge>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDateTime(app.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>卡点人员排行</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topOverduePersons.length > 0 ? (
              <div className="space-y-4">
                {stats.topOverduePersons.map((person, index) => (
                  <div key={person.userId} className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0
                          ? 'bg-amber-100 text-amber-700'
                          : index === 1
                          ? 'bg-gray-100 text-gray-600'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {person.userName}
                        </p>
                        <span className="text-xs text-amber-600 font-medium">
                          {person.overdueCount} 次
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {person.department} · 平均超时 {person.avgOverdueHours} 小时
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>暂无超时记录</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>部门用印统计</span>
              <Badge variant="info">本年度</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tick={{ fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>进行中的召回</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/recalls')}
              >
                管理
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ongoingRecalls.length > 0 ? (
              <div className="space-y-3">
                {ongoingRecalls.map(recall => {
                  const confirmedCount = recall.notices.filter(n => n.status === 'confirmed').length;
                  const progress = Math.round((confirmedCount / recall.notices.length) * 100);

                  return (
                    <div
                      key={recall.id}
                      className="p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => navigate(`/recalls`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {recall.batchNo}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {recall.reason}
                          </p>
                        </div>
                        <Badge variant={recall.priority === 'high' ? 'danger' : 'warning'}>
                          {recall.priority === 'high' ? '高优先级' : recall.priority === 'medium' ? '中优先级' : '低优先级'}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>召回进度</span>
                          <span>{confirmedCount}/{recall.notices.length} 部门已确认</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>暂无进行中的召回</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
