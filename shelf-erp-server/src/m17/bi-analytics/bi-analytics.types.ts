/** 销售仪表板数据 */
export interface SalesDashboardDto {
  monthlySignedAmount: number[];
  months: string[];
  quoteConversionRate: number;
  opportunityConversionRate: number;
  avgQuoteCycleDays: number;
  customerChurnRate: number;
  topCustomers: { name: string; amount: number }[];
}

/** 生产仪表板数据 */
export interface ProductionDashboardDto {
  dailyOutputTons: number[];
  dates: string[];
  planAchievementRate: number;
  oeeAvg: number;
  defectRate: number;
  wipValue: number;
  equipmentFailureRate: number;
  lineUtilization: { line: string; rate: number }[];
}

/** 库存仪表板数据 */
export interface InventoryDashboardDto {
  totalInventoryValue: number;
  turnoverDays: number;
  slowMovingValue: number;
  safetyStockAlerts: number;
  categoryBreakdown: { category: string; value: number }[];
}

/** 财务仪表板数据 */
export interface FinanceDashboardDto {
  monthlyRevenue: number[];
  months: string[];
  grossMargin: number;
  totalAR: number;
  totalAP: number;
  cashBalance: number;
}

/** 项目利润仪表板 */
export interface ProjectProfitDashboardDto {
  activeProjectsCount: number;
  activeContractTotal: number;
  projectMarginRanking: { name: string; margin: number }[];
  delayedProjects: number;
  costOverrunProjects: number;
}

/** CEO仪表板数据 */
export interface CEODashboardDto {
  todayOutputValue: number;
  monthlySignedAmount: number;
  monthlyCollectionAmount: number;
  monthlyProfit: number;
  cashBalance: number;
  top10AR: { name: string; amount: number }[];
  capacityLoadRate: number;
  keyProjectProgress: { name: string; progress: number }[];
  customerSatisfactionAvg: number;
  profitTrend12m: number[];
  profitTrendMonths: string[];
}
