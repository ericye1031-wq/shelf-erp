import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type { Organization, User, Role, Permission, Dictionary, SystemLog, SystemConfig } from '@/types/m01';

const BASE = '/m01';

export const getOrganizations = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Organization>>(`${BASE}/organizations`, { params });

export const getOrganizationById = (id: string) =>
  api.get<Organization>(`${BASE}/organizations/${id}`);

export const createOrganization = (data: Partial<Organization>) =>
  api.post<Organization>(`${BASE}/organizations`, data);

export const updateOrganization = (id: string, data: Partial<Organization>) =>
  api.put<Organization>(`${BASE}/organizations/${id}`, data);

export const deleteOrganization = (id: string) =>
  api.delete(`${BASE}/organizations/${id}`);

export const getUsers = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<User>>(`${BASE}/users`, { params });

export const getUserById = (id: string) =>
  api.get<User>(`${BASE}/users/${id}`);

export const createUser = (data: Partial<User>) =>
  api.post<User>(`${BASE}/users`, data);

export const updateUser = (id: string, data: Partial<User>) =>
  api.put<User>(`${BASE}/users/${id}`, data);

export const deleteUser = (id: string) =>
  api.delete(`${BASE}/users/${id}`);

export const getRoles = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Role>>(`${BASE}/roles`, { params });

export const getRoleById = (id: string) =>
  api.get<Role>(`${BASE}/roles/${id}`);

export const createRole = (data: Partial<Role>) =>
  api.post<Role>(`${BASE}/roles`, data);

export const updateRole = (id: string, data: Partial<Role>) =>
  api.put<Role>(`${BASE}/roles/${id}`, data);

export const deleteRole = (id: string) =>
  api.delete(`${BASE}/roles/${id}`);

export const getPermissions = () =>
  api.get<Permission[]>(`${BASE}/permissions`);

export const getDictionaries = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Dictionary>>(`${BASE}/dictionaries`, { params });

export const createDictionary = (data: Partial<Dictionary>) =>
  api.post<Dictionary>(`${BASE}/dictionaries`, data);

export const updateDictionary = (id: string, data: Partial<Dictionary>) =>
  api.put<Dictionary>(`${BASE}/dictionaries/${id}`, data);

export const deleteDictionary = (id: string) =>
  api.delete(`${BASE}/dictionaries/${id}`);

export const getLogs = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<SystemLog>>(`${BASE}/logs`, { params });

export const getConfigs = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<SystemConfig>>(`${BASE}/configs`, { params });

export const updateConfig = (id: string, data: Partial<SystemConfig>) =>
  api.put<SystemConfig>(`${BASE}/configs/${id}`, data);
