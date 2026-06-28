import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type { Scheme, SchemeVersion, Drawing } from '@/types/m03';

const SCHEME_BASE = '/m03/schemes';
const DRAWING_BASE = '/m03/drawings';

/** ========== 方案管理 ========== */

export const getSchemes = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Scheme>>(`${SCHEME_BASE}`, { params });

export const getSchemeById = (id: string) =>
  api.get<Scheme>(`${SCHEME_BASE}/${id}`);

export const createScheme = (data: Partial<Scheme>) =>
  api.post<Scheme>(`${SCHEME_BASE}`, data);

export const updateScheme = (id: string, data: Partial<Scheme>) =>
  api.put<Scheme>(`${SCHEME_BASE}/${id}`, data);

export const deleteScheme = (id: string) =>
  api.delete(`${SCHEME_BASE}/${id}`);

export const changeSchemeStatus = (id: string, status: string) =>
  api.put(`${SCHEME_BASE}/${id}/status`, { status });

/** 方案版本 */
export const getSchemeVersions = (schemeId: string) =>
  api.get<SchemeVersion[]>(`${SCHEME_BASE}/${schemeId}/versions`);

export const createSchemeVersion = (schemeId: string, data: Partial<SchemeVersion>) =>
  api.post<SchemeVersion>(`${SCHEME_BASE}/${schemeId}/versions`, data);

export const approveSchemeVersion = (versionId: string, approvedBy: string) =>
  api.put(`${SCHEME_BASE}/versions/${versionId}/approve`, { approvedBy });

/** ========== 图文档管理 ========== */

export const getDrawings = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Drawing>>(`${DRAWING_BASE}`, { params });

export const getDrawingsByCategory = (category: string) =>
  api.get<Drawing[]>(`${DRAWING_BASE}/by-category/${category}`);

export const getDrawingById = (id: string) =>
  api.get<Drawing>(`${DRAWING_BASE}/${id}`);

export const createDrawing = (data: Partial<Drawing>) =>
  api.post<Drawing>(`${DRAWING_BASE}`, data);

export const updateDrawing = (id: string, data: Partial<Drawing>) =>
  api.put<Drawing>(`${DRAWING_BASE}/${id}`, data);

export const deleteDrawing = (id: string) =>
  api.delete(`${DRAWING_BASE}/${id}`);

export const changeDrawingStatus = (id: string, status: string) =>
  api.put(`${DRAWING_BASE}/${id}/status`, { status });
