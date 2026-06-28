import type { AuditFields, ProjectLinked } from './common';

/** 成本维度 */
export interface CostDimension {
  id: string;
  projectId: string;
  category: 'material' | 'labor' | 'overhead' | 'outsourcing' | 'logistics' | 'other';
  budgetAmount: number;
  actualAmount: number;
  committedAmount: number;
  remainingBudget: number;
  unit: string;
  period: string;
  audit: AuditFields & ProjectLinked;
}

/** 成本差异 */
export interface CostVariance {
  id: string;
  projectId: string;
  dimensionId: string;
  category: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  varianceRate: number;
  reason: string;
  period: string;
  createdAt: string;
}

/** 成本预警 */
export interface CostAlert {
  id: string;
  projectId: string;
  dimensionId: string;
  category: string;
  type: 'over_budget' | 'approaching_budget' | 'unusual_spending';
  level: 'info' | 'warning' | 'critical';
  threshold: number;
  actualValue: number;
  message: string;
  isRead: boolean;
  triggeredAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
}
