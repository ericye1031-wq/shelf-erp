/** 项目状态 */
export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

/** 里程碑状态 */
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

/** 预警类型 */
export type AlertType = 'deadline' | 'cost' | 'quality' | 'resource' | 'custom';

/** 预警级别 */
export type AlertLevel = 'info' | 'warning' | 'critical';

/** 项目 */
export interface Project {
  id: string;
  code: string;
  name: string;
  contractId: string | null;
  customerId: string | null;
  customerName: string | null;
  managerId: string | null;
  managerName: string | null;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  status: ProjectStatus;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 里程碑 */
export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  plannedDate: string | null;
  actualDate: string | null;
  progress: number;
  status: MilestoneStatus;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 预警 */
export interface Alert {
  id: string;
  projectId: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  content: string | null;
  isRead: boolean;
  triggeredAt: string;
  resolvedAt: string | null;
}

/** 甘特图任务 */
export interface GanttTask {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  parentId: string | null;
  assignee: string | null;
  color: string | null;
  dependency: string | null;
}
