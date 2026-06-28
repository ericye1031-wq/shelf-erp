/** 成本预测目标类型 */
export type CostTargetType = 'material' | 'project';

/** 成本趋势数据点 */
export interface CostTrendPoint {
  date: string;
  actual: number;
  predicted?: number;
  upperBound?: number;
  lowerBound?: number;
}

/** AI成本预测结果 */
export interface CostPrediction {
  id: string;
  targetId: string;
  targetName: string;
  targetType: CostTargetType;
  months: number;
  trendData: CostTrendPoint[];
  predictedTotal: number;
  confidence: number;
  predictedAt: string;
  status: 'active' | 'archived';
}

/** 成本预测历史 */
export interface CostPredictionHistory {
  id: string;
  targetName: string;
  targetType: CostTargetType;
  months: number;
  predictedTotal: number;
  actualTotal?: number;
  accuracy?: number;
  createdAt: string;
}

/** 预测目标选项 */
export interface CostTargetOption {
  id: string;
  name: string;
  type: CostTargetType;
}

/** 查询参数 */
export interface QueryCostPredictionParams {
  targetId?: string;
  targetType?: CostTargetType;
  page?: number;
  pageSize?: number;
}
