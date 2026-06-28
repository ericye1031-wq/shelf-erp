// M17 BI商业智能模块类型定义

// 仪表板类型
export type DashboardType = 'sales' | 'purchase' | 'inventory' | 'finance' | 'project' | 'custom';

// 组件类型
export type WidgetType = 'chart' | 'table' | 'kpi' | 'gauge' | 'pie' | 'bar' | 'line' | 'area';

// 仪表板接口
export interface Dashboard {
  id: number;
  dashboardNo: string;
  name: string;
  description?: string;
  type: DashboardType;
  layout?: any;
  widgets?: Widget[];
  isPublic: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 组件接口
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  [key: string]: any;
}

// 报表类型
export type ReportType = 'sales' | 'purchase' | 'inventory' | 'finance' | 'project' | 'custom';

// 报表格式
export type ReportFormat = 'table' | 'chart' | 'pivot' | 'summary';

// 报表接口
export interface Report {
  id: number;
  reportNo: string;
  name: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  sqlQuery?: string;
  parameters?: any;
  columns?: any[];
  filters?: any[];
  chartConfig?: any;
  isPublic: boolean;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// KPI类型
export type KPIType = 'sales' | 'purchase' | 'inventory' | 'finance' | 'project' | 'custom';

// KPI单位
export type KPIUnit = 'count' | 'amount' | 'percentage' | 'days' | 'ratio';

// KPI趋势
export type KPITrend = 'up' | 'down' | 'flat';

// KPI接口
export interface KPI {
  id: number;
  kpiNo: string;
  name: string;
  description?: string;
  type: KPIType;
  unit: KPIUnit;
  calculation: string;
  target?: number;
  actual: number;
  achievementRate?: number;
  trend: KPITrend;
  trendValue?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 数据源类型
export type DataSourceType = 'sqlite' | 'mysql' | 'postgresql' | 'sqlserver' | 'oracle' | 'api' | 'excel' | 'csv';

// 数据源接口
export interface DataSource {
  id: number;
  sourceNo: string;
  name: string;
  description?: string;
  type: DataSourceType;
  connectionString?: string;
  config?: any;
  isActive: boolean;
  isDefault: boolean;
  lastTestAt?: string;
  lastTestSuccess: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 查询参数
export interface QueryDashboardParams {
  name?: string;
  type?: DashboardType;
  isPublic?: boolean;
  createdBy?: string;
  page?: number;
  pageSize?: number;
}

export interface QueryReportParams {
  name?: string;
  type?: ReportType;
  format?: ReportFormat;
  isPublic?: boolean;
  isActive?: boolean;
  createdBy?: string;
  page?: number;
  pageSize?: number;
}

export interface QueryKPIParams {
  name?: string;
  type?: KPIType;
  unit?: KPIUnit;
  trend?: KPITrend;
  isActive?: boolean;
  createdBy?: string;
  page?: number;
  pageSize?: number;
}

export interface QueryDataSourceParams {
  name?: string;
  type?: DataSourceType;
  isActive?: boolean;
  isDefault?: boolean;
  createdBy?: string;
  page?: number;
  pageSize?: number;
}
