import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type {
  WorkOrder, ProcessStep, ScheduleItem, ScanRecord,
  Equipment, QualityCheck, OeeData, ProcessRoute, MaterialDemand,
} from '@/types/m10';

const BASE = '/m10';

export const getWorkOrders = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<WorkOrder>>(`${BASE}/work-orders`, { params });

export const getWorkOrderById = (id: string) =>
  api.get<WorkOrder>(`${BASE}/work-orders/${id}`);

export const createWorkOrder = (data: Partial<WorkOrder>) =>
  api.post<WorkOrder>(`${BASE}/work-orders`, data);

export const updateWorkOrder = (id: string, data: Partial<WorkOrder>) =>
  api.put<WorkOrder>(`${BASE}/work-orders/${id}`, data);

export const deleteWorkOrder = (id: string) =>
  api.delete(`${BASE}/work-orders/${id}`);

export const releaseWorkOrder = (id: string) =>
  api.post<WorkOrder>(`${BASE}/work-orders/${id}/release`);

export const getProcessSteps = (workOrderId: string) =>
  api.get<ProcessStep[]>(`${BASE}/work-orders/${workOrderId}/process-steps`);

export const getSchedule = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ScheduleItem>>(`${BASE}/schedule`, { params });

export const updateSchedule = (id: string, data: Partial<ScheduleItem>) =>
  api.put<ScheduleItem>(`${BASE}/schedule/${id}`, data);

export const getScanRecords = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ScanRecord>>(`${BASE}/scan-records`, { params });

export const createScanRecord = (data: Partial<ScanRecord>) =>
  api.post<ScanRecord>(`${BASE}/scan-records`, data);

export const getEquipment = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Equipment>>(`${BASE}/equipment`, { params });

export const getEquipmentById = (id: string) =>
  api.get<Equipment>(`${BASE}/equipment/${id}`);

export const updateEquipment = (id: string, data: Partial<Equipment>) =>
  api.put<Equipment>(`${BASE}/equipment/${id}`, data);

export const getQualityChecks = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<QualityCheck>>(`${BASE}/quality-checks`, { params });

export const createQualityCheck = (data: Partial<QualityCheck>) =>
  api.post<QualityCheck>(`${BASE}/quality-checks`, data);

export const getOee = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<OeeData>>(`${BASE}/oee`, { params });

export const getProcessRoutes = (shelfTypeId: string) =>
  api.get<ProcessRoute[]>(`${BASE}/process-routes`, { params: { shelfTypeId } });

export const createProcessRoute = (data: Partial<ProcessRoute>) =>
  api.post<ProcessRoute>(`${BASE}/process-routes`, data);

export const getMaterialDemands = (workOrderId: string) =>
  api.get<MaterialDemand[]>(`${BASE}/work-orders/${workOrderId}/material-demands`);
