/** 安装计划状态 */
export type InstallPlanStatus = 'draft' | 'submitted' | 'in_progress' | 'completed' | 'cancelled';

/** 人员角色 */
export type WorkerRole = '队长' | '安装工' | '助手';

/** 资质状态 */
export type CertStatus = 'valid' | 'expired' | 'none';

/** 保险状态 */
export type InsuranceStatus = 'active' | 'expired' | 'none';

/** 问题类型 */
export type IssueType = '缺件' | '损坏' | '设计变更' | '客户追加需求' | '其他';

/** 问题严重程度 */
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

/** 问题状态 */
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

/** 验收结果 */
export type AcceptanceResult = 'passed' | 'with_issues' | 'failed';

/** 安装计划 */
export interface InstallPlan {
  id: string;
  code: string;
  projectId: string | null;
  contractId: string | null;
  siteAddress: string;
  startDate: string | null;
  endDate: string | null;
  safetyBriefing: string | null;
  status: InstallPlanStatus;
  acceptedBy: string | null;
  acceptedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 安装人员 */
export interface InstallTeam {
  id: string;
  planId: string;
  workerName: string;
  workerRole: WorkerRole;
  certStatus: CertStatus;
  insuranceStatus: InsuranceStatus;
  createdBy: string;
  createdAt: string;
}

/** 安装报工 */
export interface InstallReport {
  id: string;
  planId: string;
  workerName: string;
  workDate: string;
  startTime: string | null;
  endTime: string | null;
  overtimeHours: number;
  workContent: string | null;
  completionPercent: number;
  createdBy: string;
  createdAt: string;
}

/** 安装成本 */
export interface InstallCost {
  id: string;
  planId: string;
  laborFee: number;
  travelFee: number;
  accommodationFee: number;
  toolCost: number;
  materialCost: number;
  totalCost: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 现场问题 */
export interface InstallIssue {
  id: string;
  planId: string;
  issueType: IssueType;
  severity: IssueSeverity;
  description: string;
  photoUrls: string[] | null;
  status: IssueStatus;
  resolvedAt: string | null;
  solution: string | null;
  createdBy: string;
  createdAt: string;
}

/** 验收记录 */
export interface InstallAcceptance {
  id: string;
  planId: string;
  contractId: string | null;
  acceptDate: string | null;
  customerSign: string | null;
  result: AcceptanceResult;
  issueDesc: string | null;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  createdBy: string;
  createdAt: string;
}
