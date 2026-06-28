import api from './api';
import type {
  ScheduleEquipment,
  ScheduleWorkOrder,
  ScheduleResult,
  ScheduleHistory,
  QueryScheduleParams,
} from '../types/m19';

const BASE = '/m19';

export function getEquipment(): Promise<ScheduleEquipment[]> {
  return api.get(`${BASE}/equipment`);
}

export function getWorkOrders(): Promise<ScheduleWorkOrder[]> {
  return api.get(`${BASE}/work-orders`);
}

export function runScheduleOptimization(workOrderIds: string[]): Promise<ScheduleResult> {
  return api.post(`${BASE}/optimize`, { workOrderIds });
}

export function getScheduleHistory(params?: QueryScheduleParams): Promise<{ data: ScheduleHistory[]; total: number }> {
  return api.get(`${BASE}/history`, { params });
}

export function applySchedule(scheduleId: string): Promise<void> {
  return api.post(`${BASE}/history/${scheduleId}/apply`);
}
