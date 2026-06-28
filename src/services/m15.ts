import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type {
  InstallPlan, InstallTeam, InstallReport, InstallCost,
  InstallIssue, InstallAcceptance,
} from '@/types/m15';

const BASE = '/m15';

// ─── 安装计划 ───
export const getPlans = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<InstallPlan>>(`${BASE}/plans`, { params });

export const getPlanById = (id: string) =>
  api.get<InstallPlan>(`${BASE}/plans/${id}`);

export const createPlan = (data: Partial<InstallPlan>) =>
  api.post<InstallPlan>(`${BASE}/plans`, data);

export const updatePlan = (id: string, data: Partial<InstallPlan>) =>
  api.put<InstallPlan>(`${BASE}/plans/${id}`, data);

export const deletePlan = (id: string) =>
  api.delete(`${BASE}/plans/${id}`);

export const changePlanStatus = (id: string, status: string) =>
  api.put<InstallPlan>(`${BASE}/plans/${id}/status`, { status });

// ─── 人员安排 ───
export const getTeams = (planId: string) =>
  api.get<InstallTeam[]>(`${BASE}/teams`, { params: { planId } });

export const createTeam = (data: Partial<InstallTeam>) =>
  api.post<InstallTeam>(`${BASE}/teams`, data);

export const deleteTeam = (id: string) =>
  api.delete(`${BASE}/teams/${id}`);

// ─── 安装报工 ───
export const getReports = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<InstallReport>>(`${BASE}/reports`, { params });

export const createReport = (data: Partial<InstallReport>) =>
  api.post<InstallReport>(`${BASE}/reports`, data);

export const deleteReport = (id: string) =>
  api.delete(`${BASE}/reports/${id}`);

// ─── 安装成本 ───
export const getCosts = (planId: string) =>
  api.get<InstallCost[]>(`${BASE}/costs`, { params: { planId } });

export const createCost = (data: Partial<InstallCost>) =>
  api.post<InstallCost>(`${BASE}/costs`, data);

export const updateCost = (id: string, data: Partial<InstallCost>) =>
  api.put<InstallCost>(`${BASE}/costs/${id}`, data);

export const deleteCost = (id: string) =>
  api.delete(`${BASE}/costs/${id}`);

// ─── 现场问题 ───
export const getIssues = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<InstallIssue>>(`${BASE}/issues`, { params });

export const getIssueById = (id: string) =>
  api.get<InstallIssue>(`${BASE}/issues/${id}`);

export const createIssue = (data: Partial<InstallIssue>) =>
  api.post<InstallIssue>(`${BASE}/issues`, data);

export const updateIssue = (id: string, data: Partial<InstallIssue>) =>
  api.put<InstallIssue>(`${BASE}/issues/${id}`, data);

export const deleteIssue = (id: string) =>
  api.delete(`${BASE}/issues/${id}`);

// ─── 验收管理 ───
export const getAcceptances = (planId: string) =>
  api.get<InstallAcceptance[]>(`${BASE}/acceptances`, { params: { planId } });

export const createAcceptance = (data: Partial<InstallAcceptance>) =>
  api.post<InstallAcceptance>(`${BASE}/acceptances`, data);

export const deleteAcceptance = (id: string) =>
  api.delete(`${BASE}/acceptances/${id}`);
