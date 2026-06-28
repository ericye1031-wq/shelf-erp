/** 工单优先级 */
export type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent';

/** 工单状态 */
export type WorkOrderStatus = 'pending' | 'released' | 'in_progress' | 'completed' | 'closed';

/** 工序状态 */
export type ProcessStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

/** 工单 */
export interface WorkOrder {
  id: string;
  code: string;
  projectId: string | null;
  bomId: string | null;
  shelfConfigId: string | null;
  quantity: number;
  completedQty: number;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  plannedStart: string | null;
  plannedEnd: string | null;
  actualStart: string | null;
  actualEnd: string | null;
  remark: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 工序步骤 */
export interface ProcessStep {
  id: string;
  workOrderId: string;
  stepCode: string;
  stepName: string;
  sequence: number;
  equipmentName: string | null;
  plannedMinutes: number | null;
  actualMinutes: number | null;
  status: ProcessStepStatus;
  operatorName: string | null;
  startedAt: string | null;
  completedAt: string | null;
  remark: string | null;
}

/** 排程项目 */
export interface ScheduleItem {
  id: string;
  workOrderId: string;
  processStepId: string;
  equipmentId: string;
  equipmentName: string;
  startTime: string;
  endTime: string;
  status: string;
}

/** 扫码记录 */
export interface ScanRecord {
  id: string;
  workOrderId: string;
  processStepId: string;
  operatorId: string;
  operatorName: string;
  type: string;
  quantity: number;
  defectQty: number;
  scannedAt: string;
  remark: string | null;
}

/** 设备 */
export interface Equipment {
  id: string;
  name: string;
  code: string;
  type: string;
  workshop: string;
  status: string;
  capacity: number;
  currentLoad: number;
  nextMaintenance: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 质量检查 */
export interface QualityCheck {
  id: string;
  workOrderId: string;
  processStepId: string;
  inspectorId: string;
  inspectorName: string;
  type: string;
  result: string;
  defects: Defect[];
  checkedAt: string;
  remark: string | null;
}

/** OEE数据 */
export interface OeeData {
  id: string;
  equipmentId: string;
  equipmentName: string;
  date: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  plannedTime: number;
  runTime: number;
  idealCycle: number;
  actualCycle: number;
  totalOutput: number;
  goodOutput: number;
}

/** 工艺路线 */
export interface ProcessRoute {
  id: string;
  name: string;
  shelfTypeId: string;
  steps: ProcessRouteStep[];
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 工艺路线步骤 */
export interface ProcessRouteStep {
  stepCode: string;
  stepName: string;
  sequence: number;
  equipmentType: string;
  standardMinutes: number;
  dependency: string | null;
}

/** 物料需求 */
export interface MaterialDemand {
  id: string;
  workOrderId: string;
  bomItemId: string;
  material: string;
  spec: string;
  requiredQty: number;
  availableQty: number;
  shortageQty: number;
  unit: string;
  plannedDate: string | null;
  status: string;
}

/** 缺陷记录 */
export interface Defect {
  id: string;
  workOrderId: string;
  processStepId: string;
  type: string;
  severity: string;
  quantity: number;
  description: string;
  reportedAt: string;
  reporterName: string;
  status: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  qualityCheckId?: string;
}
