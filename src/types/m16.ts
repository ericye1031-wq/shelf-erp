import type { AuditFields } from './common';

/** 服务工单状态 */
export type ServiceTicketStatus = 'pending' | 'assigned' | 'processing' | 'resolved' | 'closed' | 'cancelled';

/** 服务类型 */
export type ServiceType = 'repair' | 'maintain' | 'install' | 'consult' | 'other';

/** 服务工单 */
export interface ServiceTicket extends AuditFields {
  id: string;
  ticketNo: string;
  title: string;
  description: string;
  serviceType: ServiceType;
  priority: string;
  status: ServiceTicketStatus;
  customerId: string;
  customerName: string;
  contactPhone: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  solution: string | null;
  satisfactionScore: number | null;
}

/** 维修状态 */
export type RepairStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

/** 故障等级 */
export type FaultLevel = 'low' | 'medium' | 'high' | 'critical';

/** 维修记录 */
export interface Repair extends AuditFields {
  id: string;
  repairNo: string;
  ticketId: string | null;
  equipmentId: string | null;
  equipmentName: string | null;
  faultDesc: string;
  faultLevel: FaultLevel;
  repairDesc: string | null;
  partsUsed: string | null;
  repairCost: number | null;
  status: RepairStatus;
  repairBy: string | null;
  repairByName: string | null;
}

/** 巡检状态 */
export type InspectionStatus = 'pending' | 'processing' | 'completed' | 'exception';

/** 巡检结果 */
export type InspectionResult = 'pass' | 'fail' | 'pending';

/** 巡检类型 */
export type InspectionType = 'routine' | 'special' | 'acceptance';

/** 巡检记录 */
export interface Inspection extends AuditFields {
  id: string;
  inspectionNo: string;
  title: string;
  inspectionType: InspectionType;
  equipmentId: string | null;
  equipmentName: string | null;
  inspector: string | null;
  inspectorName: string | null;
  result: InspectionResult;
  issueDesc: string | null;
  handleSuggestion: string | null;
  status: InspectionStatus;
  inspectedAt: string | null;
}

/** 回访状态 */
export type ReturnVisitStatus = 'pending' | 'completed' | 'unreachable' | 'refused';

/** 回访方式 */
export type VisitMethod = 'phone' | 'onsite' | 'online';

/** 回访记录 */
export interface ReturnVisit extends AuditFields {
  id: string;
  visitNo: string;
  ticketId: string | null;
  customerId: string;
  customerName: string;
  visitMethod: VisitMethod;
  satisfactionScore: number | null;
  feedback: string | null;
  status: ReturnVisitStatus;
  visitedBy: string | null;
  visitedByName: string | null;
  visitedAt: string | null;
}

/** 质保状态 */
export type WarrantyStatus = 'active' | 'expiring' | 'expired' | 'void';

/** 质保类型 */
export type WarrantyType = 'full' | 'parts' | 'labor';

/** 质保记录 */
export interface Warranty extends AuditFields {
  id: string;
  warrantyNo: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  warrantyType: WarrantyType;
  status: WarrantyStatus;
  description: string | null;
}
