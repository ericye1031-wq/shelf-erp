import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type { Project, Milestone, GanttTask, Alert } from '@/types/m07';

const BASE = '/m07';

export const getProjects = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Project>>(`${BASE}/projects`, { params });

export const getProjectById = (id: string) =>
  api.get<Project>(`${BASE}/projects/${id}`);

export const createProject = (data: Partial<Project>) =>
  api.post<Project>(`${BASE}/projects`, data);

export const updateProject = (id: string, data: Partial<Project>) =>
  api.put<Project>(`${BASE}/projects/${id}`, data);

export const deleteProject = (id: string) =>
  api.delete(`${BASE}/projects/${id}`);

export const getMilestones = (projectId: string) =>
  api.get<Milestone[]>(`${BASE}/projects/${projectId}/milestones`);

export const createMilestone = (projectId: string, data: Partial<Milestone>) =>
  api.post<Milestone>(`${BASE}/projects/${projectId}/milestones`, data);

export const updateMilestone = (projectId: string, id: string, data: Partial<Milestone>) =>
  api.put<Milestone>(`${BASE}/projects/${projectId}/milestones/${id}`, data);

export const getGanttTasks = (projectId: string) =>
  api.get<GanttTask[]>(`${BASE}/projects/${projectId}/gantt`);

export const createGanttTask = (projectId: string, data: Partial<GanttTask>) =>
  api.post<GanttTask>(`${BASE}/projects/${projectId}/gantt`, data);

export const updateGanttTask = (projectId: string, id: string, data: Partial<GanttTask>) =>
  api.put<GanttTask>(`${BASE}/projects/${projectId}/gantt/${id}`, data);

export const getAlerts = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Alert>>(`${BASE}/alerts`, { params });

export const resolveAlert = (id: string) =>
  api.post<Alert>(`${BASE}/alerts/${id}/resolve`);
