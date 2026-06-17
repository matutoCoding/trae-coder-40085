import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OverdueRule } from '../types';
import { mockUsers } from '../mock/data/users';

const defaultRules: OverdueRule[] = [
  {
    urgency: 'normal',
    firstReminderHours: 24,
    secondReminderHours: 48,
    escalationHours: 72,
    escalationRoleId: 'u012',
    escalationRoleName: '王总',
  },
  {
    urgency: 'urgent',
    firstReminderHours: 12,
    secondReminderHours: 24,
    escalationHours: 36,
    escalationRoleId: 'u012',
    escalationRoleName: '王总',
  },
  {
    urgency: 'emergency',
    firstReminderHours: 4,
    secondReminderHours: 8,
    escalationHours: 12,
    escalationRoleId: 'u012',
    escalationRoleName: '王总',
  },
];

interface OverdueRuleState {
  rules: OverdueRule[];
  getRuleByUrgency: (urgency: OverdueRule['urgency']) => OverdueRule;
  updateRule: (urgency: OverdueRule['urgency'], updates: Partial<OverdueRule>) => void;
  resetRules: () => void;
}

export const useOverdueRuleStore = create<OverdueRuleState>()(
  persist(
    (set, get) => ({
      rules: defaultRules,

      getRuleByUrgency: (urgency) => {
        return get().rules.find(r => r.urgency === urgency) || defaultRules[0];
      },

      updateRule: (urgency, updates) => {
        set(state => ({
          rules: state.rules.map(rule =>
            rule.urgency === urgency ? { ...rule, ...updates } : rule
          ),
        }));
      },

      resetRules: () => {
        set({ rules: defaultRules });
      },
    }),
    {
      name: 'overdue-rule-storage',
    }
  )
);
