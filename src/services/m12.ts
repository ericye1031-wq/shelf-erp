import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type { CostDimension, CostVariance, CostAlert } from '@/types/m12';

const BASE = '/m12';

export const getCostDimensions = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<CostDimension>>(`${BASE}/dimensions`, { params });

export const getCostDimensionById = (id: string) =>
  api.get<CostDimension>(`${BASE}/dimensions/${id}`);

export const createCostDimension = (data: Partial<CostDimension>) =>
  api.post<CostDimension>(`${BASE}/dimensions`, data);

export const updateCostDimension = (id: string, data: Partial<CostDimension>) =>
  api.put<CostDimension>(`${BASE}/dimensions/${id}`, data);

export const getVariances = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<CostVariance>>(`${BASE}/variances`, { params });

export const getCostAlerts = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<CostAlert>>(`${BASE}/alerts`, { params });

export const resolveCostAlert = (id: string) =>
  api.post<CostAlert>(`${BASE}/alerts/${id}/resolve`);

export const getProjectCostSummary = (projectId: string) =>
  api.get<CostDimension[]>(`${BASE}/projects/${projectId}/cost-summary`);
