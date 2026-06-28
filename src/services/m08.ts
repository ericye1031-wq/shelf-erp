import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type { BOM, BomVersion, AlternativeMaterial } from '@/types/m08';

const BASE = '/m08';

export const getBoms = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<BOM>>(`${BASE}/boms`, { params });

export const getBomById = (id: string) =>
  api.get<BOM>(`${BASE}/boms/${id}`);

export const createBom = (data: Partial<BOM>) =>
  api.post<BOM>(`${BASE}/boms`, data);

export const updateBom = (id: string, data: Partial<BOM>) =>
  api.put<BOM>(`${BASE}/boms/${id}`, data);

export const deleteBom = (id: string) =>
  api.delete(`${BASE}/boms/${id}`);

export const getBomVersions = (bomId: string) =>
  api.get<BomVersion[]>(`${BASE}/boms/${bomId}/versions`);

export const createBomVersion = (bomId: string, data: Partial<BomVersion>) =>
  api.post<BomVersion>(`${BASE}/boms/${bomId}/versions`, data);

export const getAlternatives = (bomItemId: string) =>
  api.get<AlternativeMaterial[]>(`${BASE}/bom-items/${bomItemId}/alternatives`);

export const createAlternative = (bomItemId: string, data: Partial<AlternativeMaterial>) =>
  api.post<AlternativeMaterial>(`${BASE}/bom-items/${bomItemId}/alternatives`, data);

export const updateAlternative = (bomItemId: string, id: string, data: Partial<AlternativeMaterial>) =>
  api.put<AlternativeMaterial>(`${BASE}/bom-items/${bomItemId}/alternatives/${id}`, data);

export const deleteAlternative = (bomItemId: string, id: string) =>
  api.delete(`${BASE}/bom-items/${bomItemId}/alternatives/${id}`);

export const convertBom = (bomId: string, direction: string) =>
  api.post<BOM>(`${BASE}/boms/${bomId}/convert`, { direction });
