import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type {
  ServiceTicket,
  ServiceTicketStatus,
  ServiceType,
  Repair,
  RepairStatus,
  FaultLevel,
  Inspection,
  InspectionStatus,
  InspectionResult,
  InspectionType,
  ReturnVisit,
  ReturnVisitStatus,
  VisitMethod,
  Warranty,
  WarrantyStatus,
  WarrantyType,
} from '@/types/m16';

const BASE = '/m16';

// ===== 服务工单 =====
export const getServiceTickets = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ServiceTicket>>(`${BASE}/service-tickets`, { params });

export const getServiceTicketById = (id: string) =>
  api.get<ServiceTicket>(`${BASE}/service-tickets/${id}`);

export const createServiceTicket = (data: Record<string, unknown>) =>
  api.post<ServiceTicket>(`${BASE}/service-tickets`, data);

export const updateServiceTicket = (id: string, data: Record<string, unknown>) =>
  api.put<ServiceTicket>(`${BASE}/service-tickets/${id}`, data);

export const deleteServiceTicket = (id: string) =>
  api.delete(`${BASE}/service-tickets/${id}`);

// ===== 维修管理 =====
export const getRepairs = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Repair>>(`${BASE}/repairs`, { params });

export const getRepairById = (id: string) =>
  api.get<Repair>(`${BASE}/repairs/${id}`);

export const createRepair = (data: Record<string, unknown>) =>
  api.post<Repair>(`${BASE}/repairs`, data);

export const updateRepair = (id: string, data: Record<string, unknown>) =>
  api.put<Repair>(`${BASE}/repairs/${id}`, data);

export const deleteRepair = (id: string) =>
  api.delete(`${BASE}/repairs/${id}`);

// ===== 巡检管理 =====
export const getInspections = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Inspection>>(`${BASE}/inspections`, { params });

export const getInspectionById = (id: string) =>
  api.get<Inspection>(`${BASE}/inspections/${id}`);

export const createInspection = (data: Record<string, unknown>) =>
  api.post<Inspection>(`${BASE}/inspections`, data);

export const updateInspection = (id: string, data: Record<string, unknown>) =>
  api.put<Inspection>(`${BASE}/inspections/${id}`, data);

export const deleteInspection = (id: string) =>
  api.delete(`${BASE}/inspections/${id}`);

// ===== 客户回访 =====
export const getReturnVisits = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ReturnVisit>>(`${BASE}/return-visits`, { params });

export const getReturnVisitById = (id: string) =>
  api.get<ReturnVisit>(`${BASE}/return-visits/${id}`);

export const createReturnVisit = (data: Record<string, unknown>) =>
  api.post<ReturnVisit>(`${BASE}/return-visits`, data);

export const updateReturnVisit = (id: string, data: Record<string, unknown>) =>
  api.put<ReturnVisit>(`${BASE}/return-visits/${id}`, data);

export const deleteReturnVisit = (id: string) =>
  api.delete(`${BASE}/return-visits/${id}`);

// ===== 质保管理 =====
export const getWarranties = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Warranty>>(`${BASE}/warranties`, { params });

export const getWarrantyById = (id: string) =>
  api.get<Warranty>(`${BASE}/warranties/${id}`);

export const createWarranty = (data: Record<string, unknown>) =>
  api.post<Warranty>(`${BASE}/warranties`, data);

export const updateWarranty = (id: string, data: Record<string, unknown>) =>
  api.put<Warranty>(`${BASE}/warranties/${id}`, data);

export const deleteWarranty = (id: string) =>
  api.delete(`${BASE}/warranties/${id}`);
