import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type { ShelfType, ShelfConfig, BomCalcResult, Specification, SpecMatchResult } from '@/types/m04';

const BASE = '/m04';

export const getShelfTypes = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ShelfType>>(`${BASE}/shelf-types`, { params });

export const getShelfTypeById = (id: string) =>
  api.get<ShelfType>(`${BASE}/shelf-types/${id}`);

export const createShelfType = (data: Partial<ShelfType>) =>
  api.post<ShelfType>(`${BASE}/shelf-types`, data);

export const updateShelfType = (id: string, data: Partial<ShelfType>) =>
  api.put<ShelfType>(`${BASE}/shelf-types/${id}`, data);

export const deleteShelfType = (id: string) =>
  api.delete(`${BASE}/shelf-types/${id}`);

export const getConfigs = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ShelfConfig>>(`${BASE}/configs`, { params });

export const getConfigById = (id: string) =>
  api.get<ShelfConfig>(`${BASE}/configs/${id}`);

export const createConfig = (data: Partial<ShelfConfig>) =>
  api.post<ShelfConfig>(`${BASE}/configs`, data);

export const updateConfig = (id: string, data: Partial<ShelfConfig>) =>
  api.put<ShelfConfig>(`${BASE}/configs/${id}`, data);

export const deleteConfig = (id: string) =>
  api.delete(`${BASE}/configs/${id}`);

export const calculateBom = (configId: string) =>
  api.post<BomCalcResult>(`${BASE}/configs/${configId}/calculate-bom`);

export const getSpecifications = (shelfTypeId: string) =>
  api.get<Specification[]>(`${BASE}/shelf-types/${shelfTypeId}/specifications`);

export const createSpecification = (data: Partial<Specification>) =>
  api.post<Specification>(`${BASE}/specifications`, data);

export const updateSpecification = (id: string, data: Partial<Specification>) =>
  api.put<Specification>(`${BASE}/specifications/${id}`, data);

export const matchSpecification = (configId: string) =>
  api.post<SpecMatchResult>(`${BASE}/configs/${configId}/match-spec`);
