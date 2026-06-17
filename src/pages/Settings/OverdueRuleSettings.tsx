import React, { useState } from 'react';
import { Settings, Clock, AlertTriangle, TrendingUp, RotateCcw, Save, Bell, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { useOverdueRuleStore } from '../../store/useOverdueRuleStore';
import type { OverdueRule } from '../../types';
import { urgencyConfig } from '../../utils/status';
import { mockUsers } from '../../mock/data/users';

const urgencyOrder: OverdueRule['urgency'][] = ['normal', 'urgent', 'emergency'];

const OverdueRuleSettings: React.FC = () => {
  const { rules, updateRule, resetRules } = useOverdueRuleStore();
  const [editingRules, setEditingRules] = useState<OverdueRule[]>(rules);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (urgency: OverdueRule['urgency'], field: keyof OverdueRule, value: any) => {
    setEditingRules(prev => {
      const updated = prev.map(rule =>
        rule.urgency === urgency ? { ...rule, [field]: value } : rule
      );
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = () => {
    editingRules.forEach(rule => {
      updateRule(rule.urgency, rule);
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    resetRules();
    setEditingRules(rules);
    setHasChanges(false);
  };

  const escalationUsers = mockUsers.filter(u => u.role === 'approver' || u.role === 'system_admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">超时规则配置</h1>
          <p className="text-gray-500 mt-1">按紧急程度设置超时提醒和自动升级规则</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            恢复默认
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            保存设置
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {urgencyOrder.map(urgency => {
          const rule = editingRules.find(r => r.urgency === urgency);
          if (!rule) return null;
          const config = urgencyConfig[urgency];

          return (
            <Card key={urgency} className={urgency === 'emergency' ? 'border-rose-200' : ''}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  urgency === 'normal' ? 'bg-blue-100' :
                  urgency === 'urgent' ? 'bg-amber-100' : 'bg-rose-100'
                }`}>
                  {urgency === 'normal' && <Clock className="w-5 h-5 text-blue-600" />}
                  {urgency === 'urgent' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {urgency === 'emergency' && <TrendingUp className="w-5 h-5 text-rose-600" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{config.label}</CardTitle>
                  <Badge variant={config.variant} size="sm">
                    {urgency === 'normal' ? '普通' : urgency === 'urgent' ? '紧急' : '特急'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  一级催办（首次提醒）
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={rule.firstReminderHours}
                    onChange={(e) => handleChange(urgency, 'firstReminderHours', parseInt(e.target.value) || 1)}
                    className="w-24"
                  />
                  <span className="text-gray-500 text-sm">小时后</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Bell className="w-4 h-4 text-orange-500" />
                  二级催办（再次提醒）
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={rule.secondReminderHours}
                    onChange={(e) => handleChange(urgency, 'secondReminderHours', parseInt(e.target.value) || 1)}
                    className="w-24"
                  />
                  <span className="text-gray-500 text-sm">小时后</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <ArrowUpRight className="w-4 h-4 text-rose-500" />
                  自动升级
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type="number"
                    min={1}
                    value={rule.escalationHours}
                    onChange={(e) => handleChange(urgency, 'escalationHours', parseInt(e.target.value) || 1)}
                    className="w-24"
                  />
                  <span className="text-gray-500 text-sm">小时后升级至</span>
                </div>
                <Select
                  value={rule.escalationRoleId}
                  onChange={(e) => {
                    const user = mockUsers.find(u => u.id === e.target.value);
                    handleChange(urgency, 'escalationRoleId', e.target.value);
                    handleChange(urgency, 'escalationRoleName', user?.name || '');
                  }}
                >
                  {escalationUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}（{user.department}）
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            规则说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <p>超时达到一级催办时间后，系统自动发送第一条催办通知给审批人</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <p>超时达到二级催办时间后，系统自动发送第二条催办通知</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <p>超时达到自动升级时间后，系统自动将审批升级至指定人员处理</p>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700">
                <strong>注意：</strong>修改规则后，新提交的申请将按新规则计算超时时间；
                已有待处理节点仍按原规则执行，但会显示当前套用的规则版本。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverdueRuleSettings;
