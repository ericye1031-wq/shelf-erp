import type { AuditFields } from './common';

/** 排产设备 */
export interface ScheduleEquipment {
  id: string;
  name: string;
  type: string;
}

/** 排产工单 */
export interface ScheduleWorkOrder {
  id: string;
  code: string;
  productName: string;
  quantity: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

/** 甘特图条项 */
export interface GanttBar {
  id: string;
  workOrderId: string;
  workOrderCode: string;
  equipmentId: string;
  equipmentName: string;
  startHour: number;
  endHour: number;
  color: string;
  status: 'pending' | 'running' | 'completed' | 'delayed';
}

/** AI排产结果 */
export interface ScheduleResult {
  id: string;
  batchId: string;
  makespan: number;
  equipmentUtilization: number;
  changeoverTime: number;
  ganttBars: GanttBar[];
  createdAt: string;
  workOrderIds: string[];
}

/** AI排产历史记录 */
export interface ScheduleHistory {
  id: string;
  batchId: string;
  makespan: number;
  equipmentUtilization: number;
  workOrderCount: number;
  createdAt: string;
  status: 'simulated' | 'applied';
}

/** 排产查询参数 */
export interface QueryScheduleParams {
  batchId?: string;
  page?: number;
  pageSize?: number;
}
